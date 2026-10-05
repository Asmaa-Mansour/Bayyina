"""
Convert pages of a scanned book PDF into small WebP images for the Bayyina page viewer.

Only the pages your JSON data actually references are converted (use --json), so the
frontend stays small. Output files are named by the PRINTED page number, which is what
`page_from` holds in your data:   <out>/148.webp

Usage examples (run from the backend folder):

  # Only pages used by the JSON file, printed page 148 = PDF page 160  ->  offset 12
  python pdf_to_pages.py "book.pdf" --out ../frontend/public/pages/shafii ^
         --json data/minhaj_altalibin_kitab_altahara.json --offset 12

  # Convert a fixed range of printed pages instead
  python pdf_to_pages.py "book.pdf" --out out_dir --range 100-180 --offset 12

  # Convert every page (large!)
  python pdf_to_pages.py "book.pdf" --out out_dir --all

--offset = (PDF page number) - (printed page number).
  Example: the page printed as "148" is the 160th page of the PDF  ->  --offset 12.
  If printed numbers equal PDF numbers, use --offset 0 (the default).

Requires:  pip install pymupdf pillow
(If PyMuPDF is missing the script falls back to the `pdftoppm` tool from poppler.)
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

MAX_SPAN = 10  # ignore absurd page_from..page_to ranges


# ----------------------------------------------------------------------------
# Rendering backends
# ----------------------------------------------------------------------------
try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


class Renderer:
    def __init__(self, pdf_path, width):
        self.pdf_path = pdf_path
        self.width = width
        if fitz is not None:
            self.doc = fitz.open(pdf_path)
            self.page_count = self.doc.page_count
            self.backend = "pymupdf"
        elif shutil.which("pdftoppm") and shutil.which("pdfinfo"):
            out = subprocess.run(["pdfinfo", pdf_path], capture_output=True, text=True).stdout
            self.page_count = int(
                next(l.split(":")[1] for l in out.splitlines() if l.startswith("Pages:"))
            )
            self.backend = "pdftoppm"
        else:
            sys.exit("Install PyMuPDF first:  pip install pymupdf pillow")

    def render(self, pdf_page):
        """Return a grayscale PIL image of the given 1-based PDF page."""
        if self.backend == "pymupdf":
            page = self.doc[pdf_page - 1]
            zoom = self.width / page.rect.width
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), colorspace=fitz.csGRAY)
            return Image.frombytes("L", (pix.width, pix.height), pix.samples)

        with tempfile.TemporaryDirectory() as tmp:
            prefix = os.path.join(tmp, "p")
            subprocess.run(
                ["pdftoppm", "-f", str(pdf_page), "-l", str(pdf_page), "-singlefile",
                 "-gray", "-scale-to-x", str(self.width), "-scale-to-y", "-1",
                 "-png", self.pdf_path, prefix],
                check=True, capture_output=True,
            )
            return Image.open(prefix + ".png").convert("L").copy()


# ----------------------------------------------------------------------------
# Which pages do we need?
# ----------------------------------------------------------------------------
def to_int(v):
    try:
        return int(str(v).strip().translate(str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")))
    except (ValueError, TypeError):
        return None


def pages_from_json(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        items = data.get("entries", data.get("data", [data]))
    else:
        items = data
    pages = set()
    for item in items:
        if not isinstance(item, dict):
            continue
        start = to_int(item.get("page_from"))
        end = to_int(item.get("page_to"))
        if not start:
            continue
        if end and start <= end <= start + MAX_SPAN:
            pages.update(range(start, end + 1))
        else:
            pages.add(start)
    return pages


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf")
    ap.add_argument("--out", required=True, help="output folder, e.g. ../frontend/public/pages/shafii")
    ap.add_argument("--offset", type=int, default=0, help="PDF page number minus printed page number")
    ap.add_argument("--json", nargs="*", default=[], help="data JSON file(s): convert only the pages they reference")
    ap.add_argument("--range", help="printed page range, e.g. 100-180")
    ap.add_argument("--all", action="store_true", help="convert every page of the PDF")
    ap.add_argument("--width", type=int, default=1100, help="image width in pixels (default 1100)")
    ap.add_argument("--quality", type=int, default=65, help="WebP quality 1-100 (default 65)")
    args = ap.parse_args()

    r = Renderer(args.pdf, args.width)
    print(f"[{r.backend}] {args.pdf}: {r.page_count} pages")

    # printed page numbers to convert
    wanted = set()
    for j in args.json:
        wanted |= pages_from_json(j)
    if args.range:
        a, b = args.range.split("-")
        wanted |= set(range(int(a), int(b) + 1))
    if args.all:
        wanted |= {p - args.offset for p in range(1, r.page_count + 1)}
    if not wanted:
        sys.exit("Nothing to convert: give --json, --range or --all.")

    os.makedirs(args.out, exist_ok=True)
    done, skipped, total_bytes = [], [], 0
    for printed in sorted(wanted):
        pdf_page = printed + args.offset
        if not 1 <= pdf_page <= r.page_count:
            skipped.append(printed)
            continue
        img = r.render(pdf_page)
        dest = os.path.join(args.out, f"{printed}.webp")
        img.save(dest, "WEBP", quality=args.quality, method=6)
        total_bytes += os.path.getsize(dest)
        done.append(printed)

    with open(os.path.join(args.out, "_pages.json"), "w", encoding="utf-8") as f:
        json.dump({"pages": done}, f)

    print(f"Converted {len(done)} pages -> {args.out}  ({total_bytes / 1e6:.1f} MB total)")
    if skipped:
        print(f"Skipped {len(skipped)} pages outside the PDF (check --offset): {skipped[:15]}"
              f"{' ...' if len(skipped) > 15 else ''}")


if __name__ == "__main__":
    main()
