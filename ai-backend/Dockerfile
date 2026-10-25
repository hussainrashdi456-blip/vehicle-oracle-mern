# Python ka official image use karein
FROM python:3.12-slim

# Working directory set karein
WORKDIR /app

# System dependencies install karein (xgboost/ultralytics ke liye zaroori)
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Pehle requirements.txt copy karein aur install karein (cache ke liye)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baaki saara code copy karein
COPY . .

# Hugging Face Spaces default port 7860 use karta hai
ENV PORT=7860

# FastAPI app ko run karein
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]