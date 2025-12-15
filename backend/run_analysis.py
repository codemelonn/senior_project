"""
Core NLP analysis module for the Bias Checker system.

This module defines and manages all machine learning models used
by the application, including:

- Emotion / sentiment classification
- Political bias detection
- Toxicity detection
- Structured AI-assisted summarization

Models are loaded once and reused across requests to ensure
efficient inference in both API and CLI contexts.

Design Goals:
- Imported by FastAPI (main.py)
- Extendable for future NLP models
- Usable independently for experimentation or testing

Authors:
- Dominik T. — NLP model development, inference logic
- Amara B.   — CLI interface and execution flow
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
flan_summarizer = None


def load_models():
    """
    Load and initialize all NLP models used by the application.

    This function must be called once before any analysis functions
    are used. It initializes multiple transformer pipelines and
    third-party models and assigns them to global variables.

    Loaded Models:
        - Emotion classifier (BERT-based)
        - Political bias classifier (DeBERTa-based)
        - Toxicity classifier (Detoxify)
        - FLAN-T5 text generation model for summarization

    Side Effects:
        - Populates global model variables
        - Uses significant memory and startup time
    """

    global emotion_classifier, summarizer, bias_model, bias_tokenizer, toxicity_model, larger_political_model, flan_summarizer

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

    # Flan model for summarization (optional)
    model_name = "google/flan-t5-large"

    summarizer = pipeline(
        "text2text-generation",
        model=model_name,
        max_length=256,
        truncation=True
    )


    print(" ==== Models loaded successfully! ==== \n")
    
# ===============================================
#   INDIVIDUAL MODEL FUNCTIONS   |   Author: Dominik T.
#
# Each individual NLP model function is defined below.
# These functions are called independently depending
# on which analyses are selected by the frontend.
# ===============================================

def run_sentiment_model(text: str, sensitivity: str):
    """
    Perform emotion-based sentiment analysis on input text.

    Uses a BERT-based emotion classifier to compute a full probability
    distribution across emotion labels and identifies the dominant emotion.

    Args:
        text (str): Input text to analyze.
        sensitivity (str): Reserved for future tuning (currently unused).

    Returns:
        dict: Dictionary containing:
            - top (dict): Highest-scoring emotion label and score
            - all_scores (list[dict]): Full emotion score distribution

        Returns None if the model is unavailable or an error occurs.
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


def run_political_model(text: str, sensitivity: str):
    """
    Analyze political leaning of the input text.

    Uses a transformer-based political bias classifier to estimate
    alignment across Left, Center, and Right categories.

    Args:
        text (str): Input text to analyze.
        sensitivity (str): Reserved for future tuning (currently unused).

    Returns:
        list[dict]: List of political labels with confidence scores,
                    or None if analysis fails.
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
    Detect toxic or harmful language in the input text.

    Uses the Detoxify model to score multiple toxicity-related categories.
    Output keys are formatted for frontend readability.

    Args:
        text (str): Input text to analyze.
        sensitivity (str): Reserved for future tuning (currently unused).

    Returns:
        dict: Mapping of formatted toxicity labels to float scores.
              Includes error information if analysis fails.
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


def run_flan_summarization_model(text: str, results: dict):
    """
    Generate a structured, human-readable interpretation of analysis results.

    This function uses a FLAN-T5 model with a carefully engineered prompt that combines:
        - Original text
        - Sentiment results
        - Political bias results
        - Toxicity findings

    The model produces a concise, neutral interpretation intended
    for end-user consumption.

    Args:
        text (str): Original input text.
        results (dict): Dictionary containing outputs from prior analyses.

    Returns:
        str: Structured summary explaining the combined analysis results.
    """

    min_words = 25
    if len(text.split()) < min_words:
        return f"(Summary skipped: text too short — needs at least {min_words} words.)"

    # ---------------------------
    # Human-readable interpretations
    # ---------------------------
    sections = ["TEXT CONTENT:\n{}\n".format(text)]

    # Sentiment
    if "sentiment" in results:
        s = results["sentiment"]["top"]["label"]
        sections.append(f"SENTIMENT RESULT: The dominant emotion detected is **{s}**.")

    # Political
    if "political" in results:
        top_pol = max(results["political"], key=lambda x: x["score"])
        sections.append(
            f"POLITICAL RESULT: The text's language most closely aligns with **{top_pol['label']}**."
        )

    # Toxicity
    if "toxicity" in results:
        tox_dict = results["toxicity"]
        top_label, top_score = max(tox_dict.items(), key=lambda x: x[1])
        if top_score < 0.01:
            sections.append("TOXICITY RESULT: The text shows **no meaningful toxicity**.")
        else:
            sections.append(
                f"TOXICITY RESULT: The text contains signs of **{top_label.lower()}**."
            )

    if len(sections) == 1:
        return "(No analyses selected, so no summary generated.)"

    # ---------------------------
    # These instructions had to be changed to multiple lines for sphinx compatibility.
    # ---------------------------
    instruction = (
        "TASK:\n"
        "You are given:\n"
        "1. The original text\n"
        "2. Human-readable summaries of sentiment, political leaning, and toxicity\n\n"
        "Write a short, objective interpretation with the following structure:\n\n"
        "OUTPUT FORMAT (VERY IMPORTANT):\n"
        "1. **Overall Tone:** One sentence describing the emotional tone.\n"
        "2. **Political Context:** One sentence describing any political leaning.\n"
        "3. **Toxicity Level:** One sentence describing whether the text contains harmful language.\n"
        "4. **Combined Interpretation:** One or two sentences summarizing how these analyses explain the text's purpose or character.\n\n"
        "RULES:\n"
        "- Do NOT repeat the original text.\n"
        "- Do NOT repeat any sentence multiple times.\n"
        "- Do NOT invent emotions or politics not implied by the results.\n"
        "- Do NOT output lists of adjectives.\n"
        "- Keep the answer factual and neutral."
    )


    prompt = "\n".join(sections) + "\n" + instruction

    print("FLAN prompt:\n", prompt)

    try:
        summary = summarizer(prompt)[0]["generated_text"]
        return summary
    except Exception as e:
        print("FLAN summarization error:", e)
        return "(Summarization model error — unable to generate summary.)"




# ===============================================
#   ANALYSIS FUNCTION   |    Authors: Dominik T.
# ===============================================
def analyze_text(text: str):
    """
    Run the full NLP analysis pipeline on the given text.

    This function executes emotion detection, summarization,
    political bias estimation, and toxicity analysis sequentially.

    Args:
        text (str): Input text to analyze.

    Returns:
        dict: Dictionary containing emotion, summary, political bias,
              and toxicity results.

    Note:
        This function is primarily retained for legacy or CLI use.
        The API uses more granular analysis functions instead.
    """

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
    Command-line interface entry point for the Bias Checker system.

    Allows developers to run NLP analysis directly from the terminal
    for testing or debugging purposes.

    Intended Usage:
        $ python run_analysis.py

    Note:
        CLI execution is currently disabled/commented out, as the
        primary usage is via the FastAPI backend.
    """

    # Handle CLI input (file or manual)
    # if len(sys.argv) > 1:
    #     file_path = sys.argv[1]
    #     if os.path.exists(file_path):
    #         with open(file_path, "r", encoding="utf-8") as f:
    #             text = f.read()
    #     else:
    #         print(f"❌ File not found: {file_path}")
    #         sys.exit(1)
    # else:
    #     print("Enter text to analyze (press Enter when done):\n")
    #     text = input("> ")

    # print("\n🔍 Running analysis...\n")
    # result = analyze_text(text)

    # # ======================
    # #  Display Results
    # # ======================
    # print("🧠 Primary Emotion:", result["emotion"]["label"])
    # print(f"   Confidence: {result['emotion']['score']:.3f}")

    # print("\n📰 Summary:")
    # print(result["summary"])

    # print("\n🏛️ Political Bias Scores:")
    # if result["political_bias"]:
    #     for k, v in result["political_bias"].items():
    #         print(f"  - {k}: {v:.3f}")
    # else:
    #     print("  (No bias detected or model error.)")

    # print("\n☣️ Toxicity Score:")
    # print(result["toxicity"])

    

if __name__ == "__main__":
    main()