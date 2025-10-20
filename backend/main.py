from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForSequenceClassification, pipeline, AutoTokenizer, DistilBertForSequenceClassification, DistilBertTokenizer
from detoxify import Detoxify
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# model = DistilBertForSequenceClassification.from_pretrained('cajcodes/DistilBERT-PoliticalBias')
# tokenizer = AutoTokenizer.from_pretrained('cajcodes/DistilBERT-PoliticalBias')
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
    emotion_results = emotion_classifier(text, return_all_scores=True)[0]
    
    # Summary
    summary_results = summarizer(text, max_length=50, min_length=5, do_sample=False)[0]['summary_text']

    # Political bias
    inputs = tokenizer(text, return_tensors="pt")
    
    # Handle out-of-vocabulary tokens by replacing them with the unk token id
    # This may be a problem and we might have to use another model since doing this can interfere with results
    unk_token_id = tokenizer.convert_tokens_to_ids(tokenizer.unk_token)
    inputs["input_ids"][inputs["input_ids"] >= model.config.vocab_size] = unk_token_id
    
    # Print number of tokens to terminal
    num_tokens = inputs["input_ids"].shape[1]
    # print(f"[Political Bias Model] Token count: {num_tokens}")
    outputs = model(**inputs)
    probs = outputs.logits.softmax(dim=1).tolist()[0]
    # Labels can be changed here.
    labels = ["Extreme Left", "Left", "Center", "Right", "Extreme Right"]
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
