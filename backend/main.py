"""
main.py
-------
FastAPI backend for the Bias Checker NLP system.

This module exposes REST API endpoints for analyzing user-provided text
using multiple NLP models, including sentiment/emotion detection,
political bias classification, toxicity detection, and AI-assisted
summarization.

The server loads all required machine learning models once at startup
to minimize per-request latency.

Primary Responsibilities:
- API routing and request validation
- Coordinating NLP model execution
- File upload handling (.txt and .pdf)
- Returning structured JSON results for frontend visualization

Intended Usage:
- Run as a FastAPI service (locally or deployed)
- Accessed by a frontend web application

Author(s):
- Backend & API Integration: Dominik T., Amara B.
"""


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
    """
    FastAPI startup hook that loads all NLP models into memory.

    This function ensures that heavyweight transformer models are loaded
    exactly once when the server starts, rather than per request.
    Model loading is executed in a background thread to avoid blocking
    the event loop.

    Side Effects:
        - Initializes global model objects in `run_analysis.py`
        - Increases initial startup time, but reduces request latency
    """
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
    """
    Health-check endpoint for the API.

    Returns:
        dict: A simple JSON message confirming that the API is running.
    """
    return {"message": "Bias Checker API running. Use POST /api/analyze or /api/analyze-file."}


@app.post("/api/analyze")
async def analyze_text_endpoint(request: Request):
    """
    Analyze raw text input using selected NLP models.

    The request body must contain JSON specifying:
        - The input text
        - Which analyses to perform (sentiment, political bias, toxicity)
        - An optional sensitivity setting (currently unused but reserved)

    Request JSON Format::

        {
            "entry": "Text to analyze",
            "sensitivity": "low|medium|high",
            "selected": {
                "sentiment": true,
                "political": true,
                "toxicity": false
            }
        }

    Behavior:
        - Only runs models explicitly selected by the user
        - Skips summarization for very short text inputs
        - Uses FLAN-based summarization to interpret combined results

    Returns:
        dict: JSON object containing:
            - results (dict): Outputs of each selected analysis
            - sensitivity (str): Echoed sensitivity setting

    Raises:
        HTTPException(500): If an unexpected server-side error occurs
    """
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

        # Printing results and the type for debugging
        min_words = 25
        if len(text.split()) < min_words:
            results["summary"] = f"Summary skipped: text too short — needs at least {min_words} words."
        else:
            results["summary"] = run_flan_summarization_model(text, results)
        if results.get("summary"):
            print("Summarization result:", results["summary"])  
        
        return {"results": results, "sensitivity": sensitivity}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    """
    Extract text content from an uploaded file.

    Supported file types:
        - Plain text (.txt)
        - PDF documents (.pdf)

    This endpoint performs **text extraction only** and does not
    run any NLP analysis. It is intended to be used as a preprocessing
    step before submitting extracted text to `/api/analyze`.

    Constraints:
        - Maximum file size: 2 MB
        - Empty files are rejected

    Args:
        file (UploadFile): Uploaded file from the client.

    Returns:
        dict: JSON object containing extracted text.

    Raises:
        HTTPException(400): Empty file or PDF extraction failure
        HTTPException(413): File exceeds size limit
        HTTPException(415): Unsupported file type
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