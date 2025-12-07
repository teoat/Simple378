FROM python:3.11-slim

WORKDIR /app

# Install minimal dependencies
RUN pip install --no-cache-dir fastapi uvicorn pydantic python-multipart

COPY minimal_backend.py .

EXPOSE 8000

CMD ["python", "minimal_backend.py"]
