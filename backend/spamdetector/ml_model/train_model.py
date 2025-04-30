import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import os
from sklearn.model_selection import train_test_split

def train_model():
    # Load cleaned data
    df = pd.read_csv(os.path.join(os.path.dirname(__file__), 'clean_spam.csv'))
    
    # Balance the dataset
    spam = df[df['label'] == 'spam']
    ham = df[df['label'] == 'ham'].sample(len(spam)*2)  # 2:1 ratio
    
    # Enhanced spam examples
    extra_spam = [
        "You've won a free iPhone! Claim now!",
        "Congratulations! You won $1000!",
        "Click here for your special offer",
        "URGENT: Your account has been compromised",
        "Limited time offer - 50% off today only"
    ]
    extra_data = pd.DataFrame({'text': extra_spam, 'label': ['spam']*len(extra_spam)})
    
    df = pd.concat([spam, ham, extra_data])
    
    # Convert labels
    df['label'] = df['label'].map({'ham': 0, 'spam': 1})
    
    # Improved text processing
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 3),
        max_features=10000,
        min_df=5
    )
    
    model = Pipeline([
        ('tfidf', vectorizer),
        ('clf', MultinomialNB(alpha=0.05))
    ])
    
    # Train and save
    model.fit(df['text'], df['label'])
    joblib.dump(model, os.path.join(os.path.dirname(__file__), 'spam_model.joblib'))
    
    # Verify with critical tests
    test_messages = [
        ("You've won a free iPhone!", 1),
        ("Team meeting at 3pm", 0),
        ("Claim your prize now", 1),
        ("Project status update", 0)
    ]
    
    for text, expected in test_messages:
        pred = model.predict([text])[0]
        print(f"{'✅' if pred == expected else '❌'} {text} -> {'SPAM' if pred else 'HAM'}")
    
    return model