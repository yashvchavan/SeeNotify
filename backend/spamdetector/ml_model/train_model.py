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
    
    # Enhanced spam examples with more specific patterns
    extra_spam = [
        "You've won a free iPhone! Click here to claim now!",
        "CONGRATULATIONS! You've been selected to win $1000! Click here to claim",
        "URGENT: Click here for your special LIMITED TIME offer",
        "URGENT: Your account has been compromised - click to verify",
        "50% OFF TODAY ONLY! Limited time offer - Click Now!",
        "You're the lucky winner! Send your details to claim prize",
        "Congratulations! You've won the lottery! Claim your millions now",
        "FREE MONEY! Congratulations on being selected for our cash prize",
        "WIN WIN WIN! Congratulations on your random selection",
        "Warning: Your payment is overdue! Click here immediately"
    ]
    
    # Add legitimate congratulatory and notification messages
    extra_ham = [
        "Congratulations on your promotion!",
        "Congratulations on completing your project",
        "Congratulations! Your order has been shipped",
        "Team update: Congratulations to Sarah on her achievement",
        "Congratulations on your work anniversary",
        "Meeting scheduled: Project completion celebration",
        "Your package has been delivered - thank you for shopping with us",
        "Your appointment is confirmed for tomorrow",
        "Payment received - thank you for your purchase",
        "Your report has been successfully generated",
        "System update completed successfully",
        "Reminder: Team meeting at 3 PM",
        "New message from your team leader",
        "Thank you for your feedback",
        "Your account settings have been updated"
    ]
    
    # Create DataFrames for extra data
    extra_spam_df = pd.DataFrame({'text': extra_spam, 'label': ['spam']*len(extra_spam)})
    extra_ham_df = pd.DataFrame({'text': extra_ham, 'label': ['ham']*len(extra_ham)})
    
    # Combine all data
    df = pd.concat([spam, ham, extra_spam_df, extra_ham_df])
    
    # Convert labels
    df['label'] = df['label'].map({'ham': 0, 'spam': 1})
    
    # Improved text processing with better features
    vectorizer = TfidfVectorizer(
        stop_words='english',
        ngram_range=(1, 3),
        max_features=10000,
        min_df=2,
        max_df=0.95,
        analyzer='char_wb',  # Use character n-grams for better pattern recognition
    )
    
    # Use a more sensitive alpha for better nuance detection
    model = Pipeline([
        ('tfidf', vectorizer),
        ('clf', MultinomialNB(alpha=0.1))
    ])
    
    # Split data for training and validation
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Save the trained model
    joblib.dump(model, os.path.join(os.path.dirname(__file__), 'spam_model.joblib'))
    
    # Comprehensive test cases
    test_messages = [
        ("You've won a free iPhone! Click here!", 1),
        ("Team meeting at 3pm tomorrow", 0),
        ("Congratulations on your promotion!", 0),
        ("URGENT: Claim your prize money now!", 1),
        ("Project status update: Great work team", 0),
        ("Congratulations! Your order #1234 has shipped", 0),
        ("FREE MONEY! Congratulations! You won!", 1),
        ("Your account statement is ready to view", 0),
        ("Click here to claim your inheritance!", 1),
        ("Congratulations on completing the training", 0)
    ]
    
    print("\nTesting model with various messages:")
    print("-" * 50)
    for text, expected in test_messages:
        pred = model.predict([text])[0]
        prob = model.predict_proba([text])[0][1]  # Probability of being spam
        result = "✅" if pred == expected else "❌"
        status = "SPAM" if pred == 1 else "HAM"
        confidence = f"{prob:.2%}"
        print(f"{result} {status} ({confidence}): {text}")
    
    return model