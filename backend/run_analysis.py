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

from transformers import pipeline 
import json
import sys
import os 

# ==========================
#   MODEL INITIALIZATION
# ==========================

# debugging stmt
print(" ==== Loading models (this may take a moment)... ==== \n")


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
# Secondary workshop model
# =========================
"""
Emotion classifier trained in a HF workshop context; returning scores for every label
(since we set top_k=None), useful to see distribution of emotions rather than a winner
"""
workshop_model_name = "rrpetroff/huggingface-workshop-emotions-bert"
workshop_classifier = pipeline(
    "text-classification", 
    model = workshop_model_name, 
    tokenizer = workshop_model_name,
    top_k = None
)

# =====================
# Summarization model
# =====================
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

print(" ==== Models loaded successfully! ==== \n")

# =============================================
#   ANALYSIS FUNCTION   |    Authors: Dominik T. 
# =============================================
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

    # Emotion model results
    emotion_results = emotion_classifier(text, return_all_scores=True)[0]
    best_emotion = max(emotion_results, key=lambda x: x["score"])

    # Workshop model results
    workshop_results = workshop_classifier(text, return_all_scores=True)[0]
    best_workshop = max(workshop_results, key=lambda x: x["score"])

    # Summarization
    summary = summarizer(text, max_length=60, min_length=5, do_sample=False)[0]["summary_text"]

    # Simple reasoning keyword detection
    keywords = {
        "joy": ["happy","love","great","excited","wonderful","joy","pleased"],
        "sadness": ["sad","unhappy","sorrow","grief","cry","pain"],
        "anger": ["angry","furious","mad","hate","resent"],
        "fear": ["fear","afraid","scared","nervous","worried"],
        "surprise": ["surprised","shock","unexpected","wow"],
        "love": ["love","affection","cherish","fond"]
    }
    reason_words = [w for w in keywords.get(best_emotion["label"].lower(), []) if w in text.lower()]
    reason_str = ", ".join(reason_words) if reason_words else "No obvious keywords found."

    # Return structured result
    return {
        "best_emotion": best_emotion,
        "best_workshop": best_workshop,
        "all_emotion_scores": emotion_results,
        "all_workshop_scores": workshop_results,
        "summary": summary,
        "reason": reason_str
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

    # Display results
    print("🧠 Primary Emotion:", result["best_emotion"])
    print("🎭 Workshop Emotion:", result["best_workshop"])
    print("📝 Summary:", result["summary"])
    print("💡 Reason:", result["reason"])

    print("\nAll Emotion Scores:")
    for r in result["all_emotion_scores"]:
        print(f"  - {r['label']}: {r['score']:.3f}")

    print("\nAll Workshop Scores:")
    for r in result["all_workshop_scores"]:
        print(f"  - {r['label']}: {r['score']:.3f}")

if __name__ == "__main__":
    main()