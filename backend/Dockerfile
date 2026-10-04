FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Backend code + the prebuilt vector DB
COPY main.py ./main.py
COPY fiqh_chroma_db_gemini ./fiqh_chroma_db_gemini

# GEMINI_API_KEY is NOT baked in: set it as an environment variable on the host
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
