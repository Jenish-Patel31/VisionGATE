FROM python:3.11-slim

# Install system dependencies required for pdf2image and opencv
RUN apt-get update && apt-get install -y \
    poppler-utils \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p input_pdf output_images data

# Run the application
# Use shell form to allow variable expansion of $PORT provided by Render
CMD sh -c "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"
