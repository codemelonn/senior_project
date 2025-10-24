"""
This will be used to test larger NLP models separately from the main application.

The use for these larger NLPs are to deal with the 512 token limit of transformers models.
For example, we may want to use Longformer or BigBird models here; but for now, this will be more of a testing ground.
"""

from transformers import pipeline

# Info for this model can be found here: https://huggingface.co/matous-volf/political-leaning-deberta-large
# Might need a protobuf install to get this working properly: pip install protobuf
pipe = pipeline(
    "text-classification",
    model="matous-volf/political-leaning-deberta-large",
    tokenizer="microsoft/deberta-v3-large",
)

text = ["We should do more to help the environment and combat climate change.",
        "The government should reduce taxes to stimulate economic growth.",
        "I believe in equal rights for all individuals regardless of their background."]

# output = pipe(text)
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

print(results)