
# To run this file, you need to have the transformers library installed.
# You can install it via pip if you haven't already: 
#       pip install transformers

from transformers import AutoModelForSequenceClassification, pipeline, AutoTokenizer

# Example usage of sentiment analysis pipeline
# This is more of a simplistic test to ensure transformers is working.
# This variant is not very useful at the moment because it only does positive/negative sentiment.

classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")

print(classifier("I am very disappointed your performance."))
print(classifier("I am very happy with your performance."))

#----------------------------------------------------------------
# Two NLP tasks: Emotion classification and summarization


# 1. Load an emotion classification model
# Info can be found here: https://huggingface.co/bhadresh-savani/bert-base-uncased-emotion
# This model classifies text into one of six emotions: joy, sadness, anger, fear, surprise, love
# Data set used for this model: Twitter-Sentiment-Analysis.
emotion_model_name = "bhadresh-savani/bert-base-uncased-emotion"
emotion_classifier = pipeline("text-classification", model=emotion_model_name, tokenizer=emotion_model_name)

# Other models that can be used will be under this comment
test_model_workshop = "rrpetroff/huggingface-workshop-emotions-bert"
workshop_classifier = pipeline("text-classification", model=test_model_workshop, tokenizer=test_model_workshop, return_all_scores=True)

# 2. Load summarization model
# Info can be found here: https://huggingface.co/facebook/bart-large-cnn
# This model is fine-tuned for summarization tasks.
summarizer_name = "facebook/bart-large-cnn"  # or any suitable summarization model
summarizer = pipeline("summarization", model=summarizer_name, tokenizer=summarizer_name)

def analyze_text(text: str):
    # THIS IS THE FIRST VERSION, COMMENTED OUT FOR NOW. SEE BELOW FOR UPDATED VERSION.
    # Keeping this here for reference.
    
    # # Emotion classification
    # result = emotion_classifier(text)[0]  # e.g. {'label': 'joy', 'score': 0.92}
    # test_workshop = workshop_classifier(text)[0]
    
    # # Summary
    # # Here is where you call the summarization model. Here we will probably manually set the min and max length. 
    # # do_sample means we want a deterministic output. True means it will sample from the distribution. False means it will take the most likely next token.
    # summary = summarizer(text, max_length=60, min_length=5, do_sample=False)[0]["summary_text"]
    
    # # Explanation: simple heuristic approach
    # # get top contributing tokens (you could use attention or LIME/SHAP here)
    # # For simplicity, we look for words in text that match emotion-keywords
    # keywords = {
    #     "joy": ["happy","love","great","excited","wonderful","joy","pleased"],
    #     "sadness": ["sad","unhappy","sorrow","grief","cry","pain"],
    #     "anger": ["angry","furious","mad","hate","resent"],
    #     "fear": ["fear","afraid","scared","nervous","worried"],
    #     "surprise": ["surprised","shock","unexpected","wow"],
    #     "love": ["love","affection","cherish","fond"]
    # }
    # reason = []
    
    # # Find keywords in the text that match the detected emotion
    # # This is a test at the moment, sometimes doesn't find any.
    # for w in keywords.get(result["label"].lower(), []):
    #     if w in text.lower():
    #         reason.append(w)
    # reason_str = ", ".join(reason) if reason else "No obvious keywords found."

    # return {
    #     "emotion_label": result["label"],
    #     "emotion_score": result["score"],
    #     "summary": summary,
    #     "reason": reason_str
    # }
    
    
    # Get all scores from both classifiers
    emotion_results = emotion_classifier(text, return_all_scores=True)[0]
    workshop_results = workshop_classifier(text, return_all_scores=True)[0]

    # Pick the top label for each model
    best_emotion = max(emotion_results, key=lambda x: x["score"])
    best_workshop = max(workshop_results, key=lambda x: x["score"])

    # Summarization
    summary = summarizer(
        text, max_length=60, min_length=5, do_sample=False
    )[0]["summary_text"]

    # Simple keyword reasoning
    keywords = {
        "joy": ["happy","love","great","excited","wonderful","joy","pleased"],
        "sadness": ["sad","unhappy","sorrow","grief","cry","pain"],
        "anger": ["angry","furious","mad","hate","resent"],
        "fear": ["fear","afraid","scared","nervous","worried"],
        "surprise": ["surprised","shock","unexpected","wow"],
        "love": ["love","affection","cherish","fond"]
    }
    reason = []
    for w in keywords.get(best_emotion["label"].lower(), []):
        if w in text.lower():
            reason.append(w)
    reason_str = ", ".join(reason) if reason else "No obvious keywords found."

    return {
        "best_emotion": best_emotion,
        "best_workshop": best_workshop,
        "all_emotion_scores": emotion_results,
        "all_workshop_scores": workshop_results,
        "summary": summary,
        "reason": reason_str
    }


# Examples
text = "I was overwhelmed with joy when I saw the children playing. It made me smile all day."
print(analyze_text(text))

text2 = "I'm sorry I was not able to be in this meeting and you have my sincere apologies."
print(analyze_text(text2))




# allsides check for api usage
# grammar analysis
