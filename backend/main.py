<<<<<<< HEAD
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForSequenceClassification, pipeline, AutoTokenizer, DistilBertForSequenceClassification
from detoxify import Detoxify
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
=======
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from run_analysis import analyze_text 

app = FastAPI(
    title = "Bias Checker NLP API",
    description = "Analyze text for emotions and provide a summary.",
    version = "1.0.0",
)

# Allow frontend connection (you can restrict origins later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # TODO: restrict to front-end origin
>>>>>>> br_api_tests
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Load models once
# Emotion model
# install model from: https://huggingface.co/bhadresh-savani/bert-base-uncased-emotion
emotional_model_name = "bhadresh-savani/bert-base-uncased-emotion"
emotion_classifier = pipeline("text-classification", model=emotional_model_name, tokenizer=emotional_model_name)

# Summarization model
# info can be found here: https://huggingface.co/facebook/bart-large-cnn
summarizer_name = "facebook/bart-large-cnn"
summarizer = pipeline("summarization", model=summarizer_name, tokenizer=summarizer_name)

# Political bias model
# info can be found here: https://huggingface.co/cajcodes/DistilBERT-PoliticalBias
model = DistilBertForSequenceClassification.from_pretrained('cajcodes/DistilBERT-PoliticalBias')
tokenizer = AutoTokenizer.from_pretrained('cajcodes/DistilBERT-PoliticalBias')

# Toxicity model
# info can be found here: https://github.com/unitaryai/detoxify
Detoxify_model = Detoxify('unbiased')

class TextInput(BaseModel):
    text: str

@app.post("/api/analyze")
def analyze_text(input: TextInput):
    text = input.text

    # Emotion
    emotion_results = emotion_classifier(text)[0]
    emotion_results = {
        "label": emotion_results["label"],
        "score": float(emotion_results["score"])
    }

    # Summary
    summary_results = summarizer(text, max_length=50, min_length=5, do_sample=False)[0]['summary_text']

    # Political bias
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = outputs.logits.softmax(dim=1).tolist()[0]
    # Labels can be changed here.
    labels = ['left', 'center', 'right']
    political_bias_results = dict(zip(labels, [float(p) for p in probs]))

    # Toxicity
    # Had to convert numpy float32 to native float for JSON serialization or else FastAPI throws an error
    toxicity_results_raw = Detoxify_model.predict(text)
    toxicity_results = {k: float(v) if isinstance(v, (np.floating, float)) else v for k, v in toxicity_results_raw.items()}

    return {
        "emotion": emotion_results,
        "summary": summary_results,
        "political_bias": political_bias_results,
        "toxicity": toxicity_results
    }
=======
# Request schema for the JSON text input 
class TextInput(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Bias Checker API running. Use POST /analyze or /analyze-file"}

# ----- JSON text endpoint -----

@app.post("/analyze")
def analyze_text_endpoint(input: TextInput):
    """
    Receives JSON: {"text": "..."} -> runs NLP -> returns result dict. 
    """

    result = analyze_text(input.text)
    if "error" in result: 
        raise HTTPException(status_code = 400, detail = result["error"])  
    return {result}


# ----- .txt file upload endpoint -----
@app.post("/analyze-file") 
async def analyze_file(file: UploadFile = File(...)): 
    """
    Accepts a text/plain .txt file via multipart/form-data.

    Frontend form example:
      <input type="file" name="file" accept=".txt,text/plain" />
    """

    # Validate the content type 
    if file.content_type not in ("text/plain",): 
        raise HTTPException(status_code = 415j, detail = "Only text/plain (.txt) files are supported.")
    
    # Size guardrail (for now)
    data = await file.read()
    if len(data) == 0: 
        raise HTTPException(status_code = 400, detail = "Empty file")
    if len(data) > 1_000_000: 
        raise HTTPException(status_code = 413, detail = "File is too large (limit 1MB)")
    
    try: 
        text = data.decode("utf-8", errors = "ignore")
    except Exception: 
        raise HTTPException(status_code = 400, detail = "Unable to decode file")
    
    result = analyze_text(text)
    if "error" in result: 
        raise HTTPException(status_code = 400, detail = result["error"])
    return result
>>>>>>> br_api_tests
