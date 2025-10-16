"""
run_analysis.py
---------------
Standalone version of the Bias Checker NLP pipeline.
Performs emotion classification, secondary workshop model classification,
and summarization — either from text input or a file.

Usage:
    python run_analysis.py                ← prompts for manual text input
    python run_analysis.py myfile.txt     ← reads text from a file
"""

from transformers import pipeline 
import sys
import os 

# ==========================
#   MODEL INITIALIZATION
# ==========================

# debugging stmt
print(" ==== Loading models (this may take a moment)...")


# ======================================
# Emotion classification (primary model)
# ======================================
emotion_model_name = "bhadresh-savani/bert-base-uncased-emotion"
emotion_classifier = pipeline("text-classification", model=emotion_model_name, tokenizer=emotion_model_name)

# =========================
# Secondary workshop model
# =========================
workshop_model_name = "rrpetroff/huggingface-workshop-emotions-bert"
workshop_classifier = pipeline("text-classification", model=workshop_model_name, tokenizer=workshop_model_name, return_all_scores=True)

# =====================
# Summarization model
# =====================
summarizer_name = "facebook/bart-large-cnn"
summarizer = pipeline("summarization", model=summarizer_name, tokenizer=summarizer_name)

# =============================================
#   ANALYSIS FUNCTION   |    Author: Dominik T. 
# =============================================
def analyze_text(text: str): 

    """Runs emotion, workshop, and summarization analysis on input text."""
    
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