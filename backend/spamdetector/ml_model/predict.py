import joblib
import os
import re
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

model_path = os.path.join(os.path.dirname(__file__), 'spam_model.joblib')
model = joblib.load(model_path)

SPAM_PATTERNS = [
    r'\b(?:win|won|free|claim|click|prize|offer|congrat)\w*\b',
    r'\b(?:urgent|limited|time|special)\b',
    r'\$\d+',
    r'\b(?:call|text)\s+\d+'
]

def predict_spam(text):
    # Rule-based checks first
    text_lower = text.lower()
    if any(re.search(pattern, text_lower) for pattern in SPAM_PATTERNS):
        return True, 0.99
    
    # Model prediction
    proba = model.predict_proba([text])[0]
    is_spam = proba[1] > 0.7  # Higher threshold
    
    return is_spam, max(proba)