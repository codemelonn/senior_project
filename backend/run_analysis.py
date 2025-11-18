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

# ===============================
#   GLOBAL MODEL INITIALIZATION
# ===============================
emotion_classifier = None
summarizer = None 
bias_model = None 
bias_tokenizer = None 
toxicity_model = None 
larger_political_model = None


def load_models():
    """
    Initialize all NLP models once (called during startup).
    """

    global emotion_classifier, summarizer, bias_model, bias_tokenizer, toxicity_model, larger_political_model

    # debugging stmt
    print("\n ==== Loading models (this may take a moment)... ==== \n")

    # Emotion classifier
    emotion_model_name = "bhadresh-savani/bert-base-uncased-emotion"
    emotion_classifier = pipeline(
        "text-classification",
        model=emotion_model_name,
        tokenizer=emotion_model_name
    )

    # Summarizer
    summarizer_name = "facebook/bart-large-cnn"
    summarizer = pipeline(
        "summarization",
        model=summarizer_name,
        tokenizer=summarizer_name
    )

    # Larger political bias model (from larger_nlp_testing.py)
    larger_political_model = pipeline(
        "text-classification",
        model="matous-volf/political-leaning-deberta-large",
        tokenizer="microsoft/deberta-v3-large",
    )
    
    # Toxicity model
    toxicity_model = Detoxify('unbiased')

    print(" ==== Models loaded successfully! ==== \n")
    
""" 
# ===============================================
#   INDIVIDUAL MODEL FUNCTIONS   |   Author: Dominik T.

Here is where we will have each individual model function defined so that when called from the frontend we can have separate outputs.
# ===============================================
"""

def run_sentiment_model(text: str, sensitivity: str):
    """
    Run sentiment analysis model on the input text.

    Args:
        text (str): The input text to analyze.

    Returns:
        dict: A dictionary with sentiment labels and their corresponding scores.
    """
    try:
            if emotion_classifier is None:
                raise RuntimeError("Emotion model not loaded")

            # Request full distribution
            outputs = emotion_classifier(text, return_all_scores=True)[0]

            # Convert everything to float and clean format
            all_scores = [
                {
                    "label": item["label"],
                    "score": float(item["score"])
                }
                for item in outputs
            ]

            # Find best emotion (highest score)
            best_emotion = max(all_scores, key=lambda x: x["score"])

            return {
                "top": best_emotion,
                "all_scores": all_scores
            }

    except Exception as e:
        print(f"Emotion model error: {e}")
        return None

# This model is no good, but we can keep it here for now until we swap it out for the larger one.
def run_political_model(text: str, sensitivity: str):
    """
    Run political bias model on the input text.

    Args:
        text (str): The input text to analyze.

    Returns:
        dict: A dictionary with political bias labels and their corresponding scores.
    """  
    try:
        if larger_political_model is None:
            raise RuntimeError("Political model not loaded")

        # Request ALL scores
        outputs = larger_political_model(text, return_all_scores=True)[0]

        # Map HuggingFace label IDs to readable names
        label_map = {
            "LABEL_0": "Left",
            "LABEL_1": "Center",
            "LABEL_2": "Right",
        }

        # Convert each output dict
        results = [
            {
                "label": label_map.get(item["label"], item["label"]),
                "score": float(item["score"])
            }
            for item in outputs
        ]

        return results

    except Exception as e:
        print(f"Political bias model error: {e}")
        return None


# Toxicity model function here but might split this into different categories for different toxicity types (e.g. toxicity, severe toxicity, identity attack, etc.)
def run_toxicity_model(text: str, sensitivity: str):
    """
    Run toxicity model on the input text using Detoxify.
    Converts numpy.float32 values to native Python floats.
    Formats label names (e.g., "identity_attack" → "Identity Attack").
    """
    try:
        if not isinstance(text, str):
            text = str(text)

        results = toxicity_model.predict(text)

        clean_results = {}

        for key, value in results.items():
            original_key = key

            # Special-case rename BEFORE formatting
            if original_key == "sexual_explicit":
                original_key = "sexually_explicit"

            # Format labels: "identity_attack" → "Identity Attack"
            formatted_key = original_key.replace("_", " ").title()

            # Convert numpy.float32 → float
            clean_results[formatted_key] = float(value)

        return clean_results

    except Exception as e:
        print("Toxicity model error:", e)
        return {"error": str(e)}


    
def run_summarization_model(text: str, sensitivity: str):
    """
    Run summarization model on the input text.

    Args:
        text (str): The input text to analyze.

    Returns:
        str: A concise summary of the input text.
    """
    summary_results = summarizer(
        text, max_length=50, min_length=5, do_sample=False
    )[0]["summary_text"]
    
    return summary_results


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
    "best_emotion": str(emotion_results["label"]),
    "emotion": {
        "label": emotion_results["label"],
        "score": float(emotion_results["score"])
    },
    "summary": str(summary_results),
    "political_bias": (
        {k: float(v) for k, v in political_bias_results.items()}
        if political_bias_results else None
    ),
    "toxicity": float(toxicity_score) if toxicity_score is not None else None
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