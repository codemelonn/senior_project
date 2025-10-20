"""
run_analysis.py
---------------
Standalone version of the Bias Checker NLP pipeline models. 

This script performs three major analyses on user-provided text input:
    1. Emotion classification using BERT-based emotion detection.
    2. Secondary emotion classification using a workshop model.
    3. Text summarization using a pretrained BART summarizer.

It supports both manual text input and file-based input from the command line.

Usage:
    $ python run_analysis.py                # prompts user for text input
    $ python run_analysis.py myfile.txt     # analyzes text from a file

Author:
    Dominik T. — NLP logic implementation
    Amara B.   — CLI interface and execution flow
"""

from transformers import (
    pipeline, 
    AutoTokenizer, 
    DistilBertForSequenceClassification, 
)  
from detoxify import Detoxify
import torch
import numpy as np 
import sys
import os 

# ==========================
#   MODEL INITIALIZATION
# ==========================

# debugging stmt
print("\n ==== Loading models (this may take a moment)... ==== \n")

# ======================================
# Emotion classification (primary model)
# ======================================
"""
BERT model fine-tuned to classify short text into discrete emotions (e.g., joy, 
fear, anger, sadness, etc.). You get the top predicted label and its confidence score
"""
emotion_model_name = "bhadresh-savani/bert-base-uncased-emotion"
emotion_classifier = pipeline(
    "text-classification", 
    model = emotion_model_name,
    tokenizer = emotion_model_name
)

# =========================
#   Political bias model
# =========================
"""
Info can be found here: https://huggingface.co/cajcodes/DistilBERT-PoliticalBias
"""
bias_model_name = "cajcodes/DistilBERT-PoliticalBias"
bias_model = DistilBertForSequenceClassification.from_pretrained(bias_model_name)
bias_tokenizer = AutoTokenizer.from_pretrained(bias_model_name)

# ========================
#   Summarization model
# ========================
"""
Large summarizer model (BART) trained on news; it compresses input text into a coherent
summary. You can tweak max_length/min_length to control summary size. 
"""
summarizer_name = "facebook/bart-large-cnn"
summarizer = pipeline(
    "summarization", 
    model = summarizer_name, 
    tokenizer = summarizer_name
)

# ===================
#   Toxicity model
# ===================
"""
Info can be found here: https://github.com/unitaryai/detoxify
"""
toxicity_model = Detoxify('unbiased')


print(" ==== Models loaded successfully! ==== \n")

# ===============================================
#   ANALYSIS FUNCTION   |    Authors: Dominik T.
# ===============================================
def analyze_text(text: str): 

    """
    Run full NLP analysis (emotion, workshop classification, and summarization).

    This function applies multiple transformer pipelines to analyze the
    emotional content and generate a short summary of the input text.

    Args:
        text (str): The input text to analyze.

    Returns:
        dict: A dictionary containing:
            - best_emotion (dict): Highest-scoring emotion from the primary model.
            - best_workshop (dict): Highest-scoring emotion from the secondary model.
            - all_emotion_scores (list[dict]): Full list of scores from primary model.
            - all_workshop_scores (list[dict]): Full list of scores from secondary model.
            - summary (str): Concise summary of the input text.
            - reason (str): Simple reasoning or detected emotional keywords.

    Example:
        >>> analyze_text("I love my job, but it's stressful at times.")
        {
            'best_emotion': {'label': 'joy', 'score': 0.89},
            'summary': 'The person enjoys their job but finds it stressful.',
            ...
        }
    """

    """Runs all models on the given text."""

    # ---- Emotion ----
    emotion_output = emotion_classifier(text)[0]
    emotion_results = {
        "label": emotion_output["label"],
        "score": float(emotion_output["score"])
    }

    # ---- Summary ----
    summary_results = summarizer(
        text, max_length=50, min_length=5, do_sample=False
    )[0]["summary_text"]


    # ---- Political Bias ----
    political_bias_results = None
    try: 
        inputs = bias_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = bias_model(**inputs)
        probs = outputs.logits.softmax(dim=1).tolist()[0]
        labels = ["left", "center", "right"]
        political_bias_results = dict(zip(labels, [float(p) for p in probs]))
    except Exception as e: 
        print(f"Political bias model error: {e}")
      

    # ---- Toxicity ----
    try:
        toxicity_raw = toxicity_model.predict(text)
        toxicity_score = toxicity_raw['toxicity']
    except Exception as e:
        print("Toxicity model error:", e)
        toxicity_score = None


    return {
        "best_emotion": emotion_results["label"],
        "emotion": emotion_results,
        "summary": summary_results,
        "political_bias": political_bias_results,
        "toxicity": toxicity_score
    }



# ==============================================
#  MAIN EXECUTION LOGIC    |   Author: Amara B
# ==============================================
def main():
    """
    Command-line interface for running the Bias Checker pipeline.

    This function handles:
        • Reading text either from a specified file or direct user input.
        • Executing the analysis pipeline via `analyze_text()`.
        • Printing formatted results to the terminal.

    Usage:
        $ python run_analysis.py mytext.txt
        $ python run_analysis.py

    Exits:
        SystemExit: If the provided file path is invalid.
    """

    # Handle CLI input (file or manual)
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            print(f"❌ File not found: {file_path}")
            sys.exit(1)
    else:
        print("Enter text to analyze (press Enter when done):\n")
        text = input("> ")

    print("\n🔍 Running analysis...\n")
    result = analyze_text(text)

    # ======================
    #  Display Results
    # ======================
    print("🧠 Primary Emotion:", result["emotion"]["label"])
    print(f"   Confidence: {result['emotion']['score']:.3f}")

    print("\n📰 Summary:")
    print(result["summary"])

    print("\n🏛️ Political Bias Scores:")
    if result["political_bias"]:
        for k, v in result["political_bias"].items():
            print(f"  - {k}: {v:.3f}")
    else:
        print("  (No bias detected or model error.)")

    print("\n☣️ Toxicity Score:")
    print(result["toxicity"])

if __name__ == "__main__":
    main()