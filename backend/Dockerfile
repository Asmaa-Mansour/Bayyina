FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy everything in the build context (respects .dockerignore): main.py + the vector index
COPY . .

# Fail early with a readable message if the index did not make it into the image
RUN test -f fiqh_chroma_db_gemini/.complete || (echo "=== INDEX MISSING. Files in /app: ===" && ls -la /app && exit 1)

# GEMINI_API_KEY is NOT baked in: set it as an environment variable on the host
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
