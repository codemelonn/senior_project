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
    allow_methods=["*"],
    allow_headers=["*"],
)

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