FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and FFmpeg
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p temp output

# Pre-download the u2net model to avoid first-use delay
RUN python -c "from rembg import new_session; new_session('u2net')"

# Copy the rest of the application
COPY . .

# Expose port and start
EXPOSE 7860
ENV PORT=7860

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
