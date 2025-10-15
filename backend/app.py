"""
Author:         Amara B
Purpose:        Turn existing NLP tests into fast API compatible code



"""



from fastapi import FastAPI
from pydantic import BaseModel
from bert_tests import analyze_text   # import the existing analyze_text function

# Create the FastAPI app
app = FastAPI(
    title="Bias Checker NLP API",
    description="API endpoint for analyzing text with emotion, bias, and summarization models.",
    version="1.0"
)

# Define a Pydantic model for input validation
class TextInput(BaseModel):
    text: str

# Define your route
@app.post("/analyze")
def analyze(input_data: TextInput):
    """
    Receives a text input, runs analysis through Hugging Face models,
    and returns results as JSON.
    """
    result = analyze_text(input_data.text)
    return result
