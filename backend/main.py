from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from NLP_tests.bert_tests import run_bert_test  # example import

app = FastAPI()

# Allow frontend connection (you can restrict origins later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class TextInput(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "Bias Checker API running"}

@app.post("/analyze")
def analyze_text(input: TextInput):
    """
    Receives text from frontend → runs NLP model → returns result
    """
    result = run_bert_test(input.text)  # You’ll define this inside bert_tests.py
    return {"input": input.text, "result": result}
