from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from run_analysis import (
    analyze_text,
    load_models, 
    run_sentiment_model, 
    run_political_model, 
    run_toxicity_model, 
    run_flan_summarization_model    
)
import uvicorn 
import io
from PyPDF2 import PdfReader

# ---------------
#   App Config
# ---------------


app = FastAPI(
    title = "Bias Checker NLP API",
    description="Analyze text for emotion, summarization, political bias, and toxicity.",
    version = "2.0.0",
)


@app.on_event("startup")
async def startup_event():
    """Load NLP models once when the server starts."""
    import asyncio
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, load_models)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # TODO: restrict to front-end origin
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------
#   Request the Schema 
# ----------------------
class TextInput(BaseModel):
    text: str
    

# ------------
#   Routes
# ------------


@app.get("/")
def home():
    return {"message": "Bias Checker API running. Use POST /api/analyze or /api/analyze-file."}

""" 
This function analyzes the input text using multiple NLP models and returns the results.
"""
@app.post("/api/analyze")
async def analyze_text_endpoint(request: Request):
    """Receives JSON: {"entry": "...", "sensitivity": "...", "selectedBiases": {...}} and returns model results."""
    try:
        data = await request.json()
        print("Received data:", data)

        # Get the text and selected biases, sensitivity doesn't really do anything yet
        text = data.get("entry", "")
        sensitivity = data.get("sensitivity", "")
        selected = data.get("selected", {})

        results = {}

        # Run only the selected analyses
        if selected.get("sentiment"):
            results["sentiment"] = run_sentiment_model(text, sensitivity)
        if selected.get("political"):
            results["political"] = run_political_model(text, sensitivity)
        if selected.get("toxicity"):
            results["toxicity"] = run_toxicity_model(text, sensitivity)

        summarization = run_flan_summarization_model(text, results)
        if summarization:
            print("Summarization result:", summarization)
        
        return {"results": results, "sensitivity": sensitivity}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    """
    Accepts .txt or .pdf, extracts text, and returns ONLY the text.
    No analysis is performed here now.
    """

    if file.content_type not in ("text/plain", "application/pdf"):
        raise HTTPException(
            status_code=415,
            detail="Only .txt and .pdf files are supported."
        )

    data = await file.read()

    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(data) > 2_000_000:  # 2 MB
        raise HTTPException(status_code=413, detail="File too large")
    
    # Extract text
    if file.content_type == "text/plain":
        text = data.decode("utf-8", errors="ignore")

    else:  # PDF
        try:
            pdf_stream = io.BytesIO(data)
            reader = PdfReader(pdf_stream)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF extraction failed: {e}")

    return { "extracted_text": text }
    


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)