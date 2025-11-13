from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from run_analysis import analyze_text, load_models, emotion_classifier, run_sentiment_model, run_political_model, run_toxicity_model
import uvicorn 

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
    
class AnalysisRequest(BaseModel):
    entry: str
    sensitivity: str
    selectedBiases: Dict[str, bool]
    

# ------------
#   Routes
# ------------


@app.get("/")
def home():
    return {"message": "Bias Checker API running. Use POST /api/analyze or /api/analyze-file."}




# @app.post("/api/analyze")
# def analyze_text_endpoint(input: TextInput):
#     """Receives JSON: {"text": "..."} and returns model results."""

#     try:
#         return analyze_text(input.text)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# 

""" 
This function analyzes the input text using multiple NLP models and returns the results.

TODO: Connect this to the frontend so that the output matches what is expected. We already have the connection to the Index page.
    All that is left is to connect the output of this function to Main.tsx.
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
        # TODO: implement other models; "racial" | "gender"
        if selected.get("sentiment"):
            results["sentiment"] = run_sentiment_model(text, sensitivity)
        if selected.get("political"):
            results["political"] = run_political_model(text, sensitivity)

        # This is for the toxicity model, but this will need to be changed depending on how we want to display the results as
        # an overall score or a breakdown of the different types of toxicity.   
        # TODO: There is a problem with how the results are being returned, so we need to adjust the format in how data is being returned.
        #       Note this might have fixed it, but we'll need to test it later; but Detoxify returns its scores as NumPy types, so we need to convert them to floats.
        #       FastAPI doesn't know how to serialize NumPy types, so we need to convert them to floats before returning.
        #       Note: I changed the code in run_analysis.py to just return the results as
        if selected.get("racial") or selected.get("gender"):
            print("toxicity scores: ", run_toxicity_model(text, sensitivity))

        # If we change it for an overall score, the code will look something like this:
        # if selected.get("toxicity"):
        #     results["toxicity"] = run_toxicity_model(text, sensitivity)
        # and we'll need to change Index.tsx to just show toxicity instead of race or gender.

        print("Analysis results:", results)

        return {"results": results, "sensitivity": sensitivity}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    """Accepts a .txt file upload and returns analysis results."""

    if file.content_type not in ("text/plain",):
        raise HTTPException(status_code=415, detail="Only text/plain files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > 1_000_000:
        raise HTTPException(status_code=413, detail="File too large (limit 1MB)")

    try:
        text = data.decode("utf-8", errors="ignore")
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to decode file")

    try:
        return analyze_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)