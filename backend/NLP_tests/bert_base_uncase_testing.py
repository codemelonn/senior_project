# To run this file, you need to have the transformers and matplotlib libraries installed.
# You can install them via pip if you haven't already:
#       pip install transformers matplotlib wordcloud

"""
Note: I found that bert-base-uncased-emotion works better than some of the other models I tried. The problem is that it is not as fast as distilbert-based models, but it is more accurate.
Not sure if there is a distilbert-based model that does emotion classification in a similar way, but this will do for now.
     -Dominik 
"""

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
