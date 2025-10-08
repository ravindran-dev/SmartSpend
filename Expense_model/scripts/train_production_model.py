#!/usr/bin/env python3
"""
Production-Ready Ultra-Enhanced Model
Fixed prediction interface for deployment
"""

import pandas as pd
import numpy as np
import re
import warnings
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import pickle
import json
from datetime import datetime
from scipy.sparse import hstack

warnings.filterwarnings('ignore')

class ProductionExpenseClassifier:
    """Production-ready classifier with simplified interface"""
    def __init__(self, model, tfidf, scaler, numeric_features, label_encoder):
        self.model = model
        self.tfidf = tfidf
        self.scaler = scaler
        self.numeric_features = numeric_features
        self.label_encoder = label_encoder
        
        # Keyword categories for feature extraction
        self.keyword_categories = {
            'food': ['food', 'restaurant', 'cafe', 'meal', 'lunch', 'dinner', 'breakfast', 
                    'snacks', 'grocery', 'milk', 'bread', 'delivery', 'dining', 'pizza', 
                    'burger', 'chicken', 'rice', 'curry', 'naan', 'biryani'],
            'transport': ['auto', 'taxi', 'train', 'bus', 'metro', 'fuel', 'gas', 'parking', 
                         'uber', 'ola', 'transport', 'vehicle', 'car'],
            'bills': ['bill', 'electric', 'electricity', 'water', 'internet', 'phone', 
                     'mobile', 'subscription', 'utility', 'service'],
            'shopping': ['shopping', 'store', 'mall', 'amazon', 'flipkart', 'clothes', 'electronics'],
            'health': ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic'],
            'entertainment': ['movie', 'cinema', 'game', 'netflix', 'entertainment'],
            'tools': ['tool', 'tools', 'equipment', 'hardware', 'saw', 'hammer', 'drill', 'wrench', 
                     'stanley', 'bosch', 'makita', 'dewalt', 'craftsman', 'precision', 'manufacturing', 
                     'workshop', 'machinery', 'component', 'spare', 'automatic', 'manual', 'industrial'],
            'business': ['business', 'office', 'consulting', 'professional', 'legal', 'accounting', 
                        'service', 'company', 'corporate', 'commercial']
        }
        
    def _clean_text(self, text):
        """Clean and normalize text"""
        text = str(text).lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = ' '.join(text.split())
        return text
    
    def _count_keywords(self, text, keywords):
        """Count keyword occurrences"""
        text_lower = text.lower()
        return sum(1 for keyword in keywords if keyword in text_lower)
    
    def _extract_features(self, note, amount):
        """Extract features for prediction"""
        note_clean = self._clean_text(note)
        
        # Basic features that match training
        features = {
            'Amount': amount,
            'LogAmount': np.log1p(amount),
            'AmountRange': self._get_amount_range(amount),
            'DayOfWeek': pd.Timestamp.now().dayofweek,
            'Month': pd.Timestamp.now().month,
            'Day': pd.Timestamp.now().day,
            'IsWeekend': 1 if pd.Timestamp.now().dayofweek >= 5 else 0,
            'IsMonthEnd': 1 if pd.Timestamp.now().day >= 25 else 0,
            'IsMonthStart': 1 if pd.Timestamp.now().day <= 5 else 0,
            'TextLength': len(note_clean),
            'WordCount': len(note_clean.split()),
            'UpperCaseRatio': sum(1 for c in note if c.isupper()) / len(note) if note else 0,
            'DigitRatio': sum(1 for c in note if c.isdigit()) / len(note) if note else 0,
        }
        
        # Add keyword features
        for category, keywords in self.keyword_categories.items():
            features[f'{category}_keywords'] = self._count_keywords(note_clean, keywords)
        
        # Pattern features
        features['HasAmountPattern'] = 1 if re.search(r'\d+\s*(rs|rupees|inr|\$)', note.lower()) else 0
        features['HasTimePattern'] = 1 if re.search(r'\d{1,2}:\d{2}', note) else 0
        features['HasPlacePattern'] = 1 if re.search(r'place\s+\d+', note.lower()) else 0
        
        return note_clean, features
    
    def _get_amount_range(self, amount):
        """Get amount range category"""
        if amount < 50:
            return 0
        elif amount < 200:
            return 1
        elif amount < 500:
            return 2
        elif amount < 1000:
            return 3
        elif amount < 5000:
            return 4
        else:
            return 5
    
    def predict(self, data):
        """Predict category for input data"""
        if isinstance(data, pd.DataFrame):
            note = data['Note'].iloc[0] if 'Note' in data.columns else ''
            amount = data['Amount'].iloc[0] if 'Amount' in data.columns else 0
        else:
            note = data.get('Note', '') if isinstance(data, dict) else ''
            amount = data.get('Amount', 0) if isinstance(data, dict) else 0

        # Extract features
        note_clean, numeric_features_dict = self._extract_features(note, amount)

        # Process text features
        text_features = self.tfidf.transform([note_clean])

        # Process numeric features - only use available ones
        numeric_array = []
        for feat in self.numeric_features:
            if feat in numeric_features_dict:
                numeric_array.append(numeric_features_dict[feat])
            else:
                numeric_array.append(0)  # Default value for missing features

        # Ensure we have the right number of features
        if len(numeric_array) != len(self.numeric_features):
            # Pad or truncate to match expected size
            if len(numeric_array) < len(self.numeric_features):
                numeric_array.extend([0] * (len(self.numeric_features) - len(numeric_array)))
            else:
                numeric_array = numeric_array[:len(self.numeric_features)]

        numeric_scaled = self.scaler.transform([numeric_array])

        # Combine features
        X_combined = hstack([text_features, numeric_scaled])

        # Predict
        prediction_encoded = self.model.predict(X_combined)[0]
        prediction = self.label_encoder.inverse_transform([prediction_encoded])[0]
        
        return prediction

def train_production_model():
    """Train production-ready model"""
    print("🚀 Training Production-Ready Ultra Model")
    print("=" * 60)
    
    # Load data
    df = pd.read_csv("../data/exp.csv")
    print(f"Dataset: {df.shape}")
    
    # Clean data
    df_clean = df.copy()
    df_clean = df_clean.dropna(subset=['Category'])
    df_clean = df_clean[df_clean['Category'].str.strip() != '']
    df_clean['Amount'] = pd.to_numeric(df_clean['Amount'], errors='coerce')
    df_clean = df_clean[df_clean['Amount'] > 0]
    df_clean['Note'] = df_clean['Note'].fillna('Unknown Transaction').astype(str)
    
    # Category mapping
    category_mapping = {
        'Food': 'Food & Dining', 'food': 'Food & Dining', 'Dinner': 'Food & Dining',
        'Lunch': 'Food & Dining', 'breakfast': 'Food & Dining', 'Grocery': 'Food & Dining',
        'snacks': 'Food & Dining', 'Milk': 'Food & Dining', 'Ice cream': 'Food & Dining',
        'Transportation': 'Transportation', 'Train': 'Transportation', 'auto': 'Transportation',
        'subscription': 'Bills & Utilities', 'Household': 'Bills & Utilities',
        'Family': 'Personal & Family', 'Festivals': 'Personal & Family',
        'Salary': 'Income', 'Interest': 'Income', 'Dividend earned on Shares': 'Income',
        'Other': 'Miscellaneous', 'Apparel': 'Apparel', 'Gift': 'Gift',
        'Healthcare': 'Healthcare', 'Medical/Healthcare': 'Healthcare'
    }
    
    df_clean['Category'] = df_clean['Category'].replace(category_mapping)
    
    # Keep categories with sufficient samples
    category_counts = df_clean['Category'].value_counts()
    valid_categories = category_counts[category_counts >= 20].index
    df_clean = df_clean[df_clean['Category'].isin(valid_categories)]
    
    print(f"Cleaned: {df_clean.shape}")
    print(f"Categories: {sorted(df_clean['Category'].unique())}")
    
    # Feature engineering
    def clean_text(text):
        text = str(text).lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        return ' '.join(text.split())
    
    def count_keywords(text, keywords):
        return sum(1 for kw in keywords if kw in text.lower())
    
    df_clean['Note_clean'] = df_clean['Note'].apply(clean_text)
    
    # Create features
    df_clean['LogAmount'] = np.log1p(df_clean['Amount'])
    df_clean['AmountRange'] = pd.cut(df_clean['Amount'], 
                                   bins=[0, 50, 200, 500, 1000, 5000, float('inf')],
                                   labels=[0, 1, 2, 3, 4, 5]).astype(int)
    
    df_clean['TextLength'] = df_clean['Note_clean'].str.len()
    df_clean['WordCount'] = df_clean['Note_clean'].str.split().str.len()
    df_clean['UpperCaseRatio'] = df_clean['Note'].apply(lambda x: sum(1 for c in x if c.isupper()) / len(x) if x else 0)
    df_clean['DigitRatio'] = df_clean['Note'].apply(lambda x: sum(1 for c in x if c.isdigit()) / len(x) if x else 0)
    
    # Keyword features
    keyword_categories = {
        'food': ['food', 'restaurant', 'chicken', 'pizza', 'meal', 'dining', 'naan', 'curry'],
        'transport': ['taxi', 'auto', 'fuel', 'parking', 'uber', 'transport', 'gas', 'metro'],
        'bills': ['bill', 'electric', 'internet', 'phone', 'subscription', 'utility'],
        'shopping': ['shopping', 'amazon', 'store', 'clothes', 'electronics', 'mall'],
        'health': ['hospital', 'doctor', 'medical', 'health', 'pharmacy', 'clinic'],
        'entertainment': ['movie', 'game', 'entertainment', 'netflix', 'cinema'],
        'tools': ['tool', 'tools', 'equipment', 'hardware', 'saw', 'hammer', 'drill', 'wrench', 
                 'stanley', 'bosch', 'makita', 'precision', 'manufacturing', 'workshop', 'machinery'],
        'business': ['business', 'office', 'consulting', 'professional', 'service', 'company']
    }
    
    for category, keywords in keyword_categories.items():
        df_clean[f'{category}_keywords'] = df_clean['Note_clean'].apply(
            lambda x: count_keywords(x, keywords)
        )
    
    # Pattern features
    df_clean['HasAmountPattern'] = df_clean['Note'].apply(lambda x: 1 if re.search(r'\d+\s*(rs|rupees|inr)', x.lower()) else 0)
    df_clean['HasTimePattern'] = df_clean['Note'].apply(lambda x: 1 if re.search(r'\d{1,2}:\d{2}', x) else 0)
    df_clean['HasPlacePattern'] = df_clean['Note'].apply(lambda x: 1 if re.search(r'place\s+\d+', x.lower()) else 0)
    
    # Temporal features (simplified)
    if 'Date' in df_clean.columns:
        df_clean['Date'] = pd.to_datetime(df_clean['Date'], errors='coerce')
        df_clean = df_clean.dropna(subset=['Date'])
        df_clean['DayOfWeek'] = df_clean['Date'].dt.dayofweek
        df_clean['Month'] = df_clean['Date'].dt.month
        df_clean['Day'] = df_clean['Date'].dt.day
        df_clean['IsWeekend'] = (df_clean['DayOfWeek'] >= 5).astype(int)
        df_clean['IsMonthEnd'] = (df_clean['Day'] >= 25).astype(int)
        df_clean['IsMonthStart'] = (df_clean['Day'] <= 5).astype(int)
    
    # Prepare features
    print("🔧 Preparing features...")
    
    # Text features
    tfidf = TfidfVectorizer(max_features=500, ngram_range=(1, 2), min_df=2, max_df=0.95)
    text_features = tfidf.fit_transform(df_clean['Note_clean'])
    
    # Numeric features
    numeric_features = [
        'Amount', 'LogAmount', 'AmountRange', 'TextLength', 'WordCount',
        'UpperCaseRatio', 'DigitRatio', 'food_keywords', 'transport_keywords',
        'bills_keywords', 'shopping_keywords', 'health_keywords', 'entertainment_keywords',
        'HasAmountPattern', 'HasTimePattern', 'HasPlacePattern'
    ]
    
    # Add temporal features if available
    if 'DayOfWeek' in df_clean.columns:
        numeric_features.extend(['DayOfWeek', 'Month', 'Day', 'IsWeekend', 'IsMonthEnd', 'IsMonthStart'])
    
    # Filter available features
    available_features = [feat for feat in numeric_features if feat in df_clean.columns]
    X_numeric = df_clean[available_features].fillna(0)
    
    # Scale features
    scaler = StandardScaler()
    X_numeric_scaled = scaler.fit_transform(X_numeric)
    
    # Combine features
    X_combined = hstack([text_features, X_numeric_scaled])
    y = df_clean['Category']
    
    print(f"Features: {X_combined.shape}")
    print(f"Categories: {y.value_counts().to_dict()}")
    
    # Label encoding
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_combined, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"Training: {X_train.shape}, Testing: {X_test.shape}")
    
    # Train optimized models
    print("🤖 Training optimized ensemble...")
    
    models = {
        'logistic_regression': LogisticRegression(C=1.5, max_iter=2000, class_weight='balanced'),
        'random_forest': RandomForestClassifier(n_estimators=200, max_depth=15, 
                                              min_samples_split=5, class_weight='balanced', random_state=42),
        'gradient_boosting': GradientBoostingClassifier(n_estimators=150, learning_rate=0.1, 
                                                      max_depth=6, random_state=42)
    }
    
    trained_models = {}
    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        score = model.score(X_test, y_test)
        trained_models[name] = model
        print(f"{name}: {score:.4f} ({score*100:.2f}%)")
    
    # Create ensemble
    ensemble = VotingClassifier(
        estimators=[(name, model) for name, model in trained_models.items()],
        voting='soft'
    )
    
    ensemble.fit(X_train, y_train)
    ensemble_score = ensemble.score(X_test, y_test)
    
    print(f"\n🏆 ENSEMBLE ACCURACY: {ensemble_score:.4f} ({ensemble_score*100:.2f}%)")
    
    # Cross-validation
    cv_scores = cross_val_score(ensemble, X_combined, y_encoded, cv=5)
    print(f"CV Mean: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # Classification report
    y_pred = ensemble.predict(X_test)
    print("\n📋 Classification Report:")
    # Get unique classes in test set to avoid mismatch
    unique_test_classes = np.unique(y_test)
    target_names_subset = [label_encoder.classes_[i] for i in unique_test_classes]
    print(classification_report(y_test, y_pred, labels=unique_test_classes, target_names=target_names_subset))
    
    # Create production model
    production_model = ProductionExpenseClassifier(
        model=ensemble,
        tfidf=tfidf,
        scaler=scaler,
        numeric_features=available_features,
        label_encoder=label_encoder
    )
    
    # Test production model
    print("\n🧪 Testing production model...")
    test_cases = [
        "CHICKEN ANGARA GARLIC NAAN restaurant food dining",
        "electricity bill payment utility service",
        "uber taxi ride transport vehicle",
        "amazon shopping electronics purchase"
    ]
    
    for case in test_cases:
        pred = production_model.predict({'Note': case, 'Amount': 500})
        print(f"  {case} → {pred}")
    
    # Save model
    print("\n💾 Saving production model...")
    
    with open("../models/expense_model.pkl", 'wb') as f:
        pickle.dump(ensemble, f)
    
    with open("../models/tfidf_vectorizer.pkl", 'wb') as f:
        pickle.dump(tfidf, f)
    
    with open("../models/feature_scaler.pkl", 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save model info
    model_info = {
        "accuracy": float(ensemble_score),
        "cv_mean": float(cv_scores.mean()),
        "cv_std": float(cv_scores.std()),
        "model_type": "Production Ensemble (Logistic + RF + GradientBoost)",
        "categories": label_encoder.classes_.tolist(),
        "training_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "features_count": int(X_combined.shape[1]),
        "improvement": f"+{(ensemble_score - 0.7417)*100:.1f}pp",
        "training_date": datetime.now().isoformat()
    }
    
    with open("../models/model_info.json", "w") as f:
        json.dump(model_info, f, indent=2)
    
    print("✅ Production model saved successfully!")
    print(f"\n🎯 PRODUCTION MODEL READY!")
    print(f"   Accuracy: {ensemble_score:.4f} ({ensemble_score*100:.2f}%)")
    print(f"   Improvement: +{(ensemble_score - 0.7417)*100:.1f} percentage points")
    
    return production_model

if __name__ == "__main__":
    train_production_model()