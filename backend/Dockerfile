FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code
COPY . .

EXPOSE 5000

CMD ["python", "./NLP_tests/bert_tests.py", "./NLP_tests/bert_base_uncase_testing"]
