"""
This will be used to test larger NLP models separately from the main application.

The use for these larger NLPs are to deal with the 512 token limit of transformers models.
For example, we may want to use Longformer or BigBird models here; but for now, this will be more of a testing ground.
"""

from transformers import pipeline

# Political large model
# Info for this model can be found here: https://huggingface.co/matous-volf/political-leaning-deberta-large
# Might need a protobuf install to get this working properly: pip install protobuf
pipe = pipeline(
    "text-classification",
    model="matous-volf/political-leaning-deberta-large",
    tokenizer="microsoft/deberta-v3-large",
)
text = [
    # Left-leaning ideas
    "Healthcare should be a universal right provided by the government.",
    "We need stricter environmental regulations to fight corporate pollution.",
    "Education should be free and accessible to everyone, regardless of income.",
    "The government should increase taxes on billionaires to reduce wealth inequality.",
    "Labor unions are essential to protect workers’ rights and ensure fair wages.",

    # Center/Moderate ideas
    "We should balance environmental protection with economic growth.",
    "The government and private sector should work together to improve healthcare access.",
    "Immigration policy should be fair but also maintain border security.",
    "Both fiscal responsibility and social programs are important for a healthy society.",
    "Gun ownership should be protected, but background checks should be mandatory.",

    # Right-leaning ideas
    "Lowering taxes and reducing government spending will strengthen the economy.",
    "Private businesses, not the government, drive innovation and job creation.",
    "Traditional family values should be preserved and promoted in society.",
    "We need to secure our borders and enforce immigration laws more strictly.",
    "The free market, not regulation, is the best way to ensure prosperity."
]

print("---- Political Bias Detection Results w/ 3 Labels ----")

results = []
for t in text:
    output = pipe(t)
    results.append(output)

# Map labels to more descriptive terms 
for output in results:
    for item in output:
        if item['label'] == 'LABEL_0':
            item['label'] = 'Left'
        elif item['label'] == 'LABEL_1':
            item['label'] = 'Center'
        elif item['label'] == 'LABEL_2':
            item['label'] = 'Right'

# Print results in a readable format
for t, r in zip(text, results):
    print(f"Text: {t}\n→ Prediction: {r[0]['label']} (score: {r[0]['score']:.4f})\n")
    
    
# Testing if we can split the labels into finer categories based on score.
print("---- Extra Labels Based on Score Intensity w/ 5 Labels----")
results = []

for t in text:
    output = pipe(t)[0]
    label = output['label']
    score = output['score']

    # Map 3 labels → 5 using intensity
    if label == 'LABEL_0':  # Left
        label = 'Far Left' if score > 0.75 else 'Left'
    elif label == 'LABEL_1':  # Center
        label = 'Center'
    elif label == 'LABEL_2':  # Right
        label = 'Far Right' if score > 0.75 else 'Right'

    results.append({'text': t, 'label': label, 'score': score})

for r in results:
    print(f"Text: {r['text']}\n→ {r['label']} ({r['score']:.4f})\n")
