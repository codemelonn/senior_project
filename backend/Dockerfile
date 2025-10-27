# Use a lightweight Python image
FROM python:3.11-slim

# Prevents Python from buffering stdout/stderr (useful for logs)
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Copy dependency file first (to use Docker cache)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files (including NLP_tests, main.py, etc.)
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# healthcheck (with a long start period for model loading)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl --fail http://localhost:8000/ || exit 1

# Command to start FastAPI (change to your entry file name if needed)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
