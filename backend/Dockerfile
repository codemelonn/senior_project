# 1) Base
FROM python:3.11-slim

# 2) System basics (optional but helpful)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl && rm -rf /var/lib/apt/lists/*

# 3) Workdir
WORKDIR /app

# 4) Install deps first so they cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5) Pre-download ALL models into the image layer
#    (same models your code loads in load_models())
RUN python - <<'PY'
from transformers import pipeline, AutoTokenizer, DistilBertForSequenceClassification
from detoxify import Detoxify
# Emotion
pipeline("text-classification", model="bhadresh-savani/bert-base-uncased-emotion")
# Summarizer
pipeline("summarization", model="facebook/bart-large-cnn")
# Political bias
DistilBertForSequenceClassification.from_pretrained("cajcodes/DistilBERT-PoliticalBias")
AutoTokenizer.from_pretrained("cajcodes/DistilBERT-PoliticalBias")
# Toxicity
Detoxify('unbiased')
print("✅ Pre-download complete")
PY

# 6) Copy the app
COPY . .

# 7) Run API (FastAPI + uvicorn)
# main.py exposes app=FastAPI() and uvicorn is what your README suggests
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
