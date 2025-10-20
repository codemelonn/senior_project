# To run this file, you need to have the transformers and matplotlib libraries installed.
# You can install them via pip if you haven't already:
#       pip install transformers matplotlib wordcloud

"""
Note: I found that bert-base-uncased-emotion works better than some of the other models I tried. 
The problem is that it is not as fast as distilbert-based models, but it is more accurate.
Not sure if there is a distilbert-based model that does emotion classification in a similar way, 
but this will do for now.
     -Dominik 
"""

import torch
from transformers import pipeline
import matplotlib.pyplot as plt
from wordcloud import WordCloud

# Load the emotional classification model
# Info can be found here: https://huggingface.co/bhadresh-savani/bert-base-uncased-emotion
# This model classifies text into one of six emotions: joy, sadness, anger, fear, surprise, love
# Data set used for this model: Twitter-Sentiment-Analysis.
model_name = "bhadresh-savani/bert-base-uncased-emotion"
classifier = pipeline("text-classification", model=model_name, tokenizer=model_name, top_k=None)

# Enter any text here to test what the analysis looks like
text = "I was overwhelmed with joy when I saw the children playing. It made me smile all day."

# This runs the classifier and gets all emotion scores
results = classifier(text)[0]

print(results)

# Extract labels and scores and put them into lists for plotting
labels = [r["label"] for r in results]
scores = [r["score"] for r in results]

# Create pie chart and enter the extracted labels and scores
plt.pie(scores, labels=labels, autopct='%1.1f%%', startangle=90, explode=[0.05]*len(labels))
plt.title(f"Emotion Distribution", wrap=True)
plt.show()

# -------------------------------
# Word Cloud of the text
# -------------------------------
plt.subplot(1, 2, 2)  # right side
wordcloud = WordCloud(width=400, height=400, background_color="white").generate(text)
plt.imshow(wordcloud, interpolation="bilinear")
plt.axis("off")
plt.title("Word Cloud of Text")

#plt.suptitle(f"Word Cloud", fontsize=12, y=0.95)
plt.tight_layout()
plt.show()

#-------------------------------
# This is going to be testing political bias detection

# Info can be found here: https://huggingface.co/peekayitachi/roberta-political-bias
# This model classifies text into one of three categories: left, center, right
# model_name = "peekayitachi/roberta-political-bias"

# classifier = pipeline("text-classification", model=model_name, tokenizer=model_name)

# # Here is where you enter your text to send it to the model
# out = classifier("The government should reduce taxes on businesses.")

# print(out)

import torch
from transformers import DistilBertForSequenceClassification, AutoTokenizer

model = DistilBertForSequenceClassification.from_pretrained('cajcodes/DistilBERT-PoliticalBias')
tokenizer = AutoTokenizer.from_pretrained('cajcodes/DistilBERT-PoliticalBias')

sample_text = "We need to significantly increase social spending because it will reduce poverty and improve quality of life for all."
"""
Other sample texts to try:
Left-leaning examples

"Healthcare should be universal and free for everyone, regardless of income."

"The government must increase taxes on the wealthy to reduce inequality."

"Climate change is the biggest threat we face and requires immediate action."

"Workers deserve higher minimum wages and stronger unions to protect their rights."

"Education should be free at public colleges and universities."


Right-leaning examples

"Lowering taxes for businesses will boost the economy and create jobs."

"Gun ownership is a constitutional right that must be protected."

"Government regulations are killing small businesses and innovation."

"Strong national borders are necessary to protect our country."

"Traditional family values are the foundation of a stable society."


Center / Moderate examples

"Balancing environmental protection with economic growth is important."

"Some government programs are necessary, but we must avoid excessive spending."

"Immigration is good for the country, but laws must be respected."
"""

inputs = tokenizer(sample_text, return_tensors='pt')

outputs = model(**inputs)
predictions = torch.softmax(outputs.logits, dim=-1)

# Define label mapping
labels = ["Extreme Left", "Left", "Center", "Right", "Extreme Right"]

# Get top prediction
pred_idx = predictions.argmax(dim=-1).item()
pred_label = labels[pred_idx]
pred_conf = predictions[0][pred_idx].item()

print("Raw probabilities:", predictions.detach().numpy())
print(f"Predicted class: {pred_label} (confidence {pred_conf:.2f})")

"""
Other models that can be used for political bias detection via Hugging Face:
peekayitachi/roberta-political-bias	A RoBERTa model fine-tuned to classify text into Left / Center / Right bias. 

cajcodes/DistilBERT-PoliticalBias	DistilBERT fine-tuned on the cajcodes/political_bias dataset; predicts political bias on a 0-4 scale (from very conservative → very liberal) 
	
matous-volf/political-leaning-deberta-large	DeBERTa-based model that outputs left/center/right leaning. 

himel7/bias-detector	Detects linguistic bias (subjective framing, loaded language) vs neutral/factual statements, etc. Doesn't necessarily give left/right, more whether the text is biased.

Other datasets that can be used for political bias detection, will need to do further testing with these models potentially:

NewB: 200,000+ Sentences for Political Bias Detection dataset	A dataset (200k+ sentences) from multiple news sources, capturing nuanced political viewpoints.
Useful for training or evaluating bias detection models.  
	
BiasLab	A dataset of news articles with dual-axis annotations for ideological bias toward Democratic/Republican parties, plus rationales. Good for more explainable bias detection. 

"""