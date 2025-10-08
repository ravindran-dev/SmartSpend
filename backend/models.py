"""
Model classes for SmartSpend ML functionality - Enhanced Version
"""

import pandas as pd
import numpy as np
import re

class EnhancedExpenseClassifier:
    """Enhanced classifier wrapper compatible with new model"""
    def __init__(self, model, tfidf, scaler, numeric_features):
        self.model = model
        self.tfidf = tfidf
        self.scaler = scaler
        self.numeric_features = numeric_features
        
        # Enhanced keyword categories
        self.keyword_categories = {
            'food': ['food', 'restaurant', 'cafe', 'meal', 'lunch', 'dinner', 'breakfast', 
                    'snacks', 'grocery', 'milk', 'bread', 'delivery', 'dining', 'pizza', 
                    'burger', 'chicken', 'rice', 'curry', 'naan', 'biryani', 'angara'],
            'transport': ['auto', 'taxi', 'train', 'bus', 'metro', 'fuel', 'gas', 'parking', 
                         'uber', 'ola', 'transport', 'vehicle', 'car'],
            'bills': ['bill', 'electric', 'electricity', 'water', 'internet', 'phone', 
                     'mobile', 'subscription', 'utility', 'service', 'recharge'],
            'shopping': ['shopping', 'store', 'mall', 'amazon', 'flipkart', 'clothes', 
                        'electronics', 'purchase'],
            'health': ['hospital', 'doctor', 'pharmacy', 'medical', 'health', 'clinic', 'medicine'],
            'entertainment': ['movie', 'cinema', 'game', 'netflix', 'entertainment', 'show']
        }

    def _clean_text(self, text):
        """Enhanced text cleaning"""
        text = str(text).lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = ' '.join(text.split())
        return text

    def _count_keywords(self, text, keywords):
        """Count keyword occurrences"""
        text_lower = text.lower()
        return sum(1 for keyword in keywords if keyword in text_lower)

    def _extract_features(self, note, amount):
        """Extract comprehensive features for prediction"""
        note_clean = self._clean_text(note)

        # Enhanced feature dictionary
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
        """Enhanced prediction with better feature handling"""
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

        # Process numeric features - handle missing features gracefully
        numeric_array = []
        for feat in self.numeric_features:
            if feat in numeric_features_dict:
                numeric_array.append(numeric_features_dict[feat])
            else:
                numeric_array.append(0)  # Default value for missing features

        # Ensure we have the right number of features
        if len(numeric_array) != len(self.numeric_features):
            if len(numeric_array) < len(self.numeric_features):
                numeric_array.extend([0] * (len(self.numeric_features) - len(numeric_array)))
            else:
                numeric_array = numeric_array[:len(self.numeric_features)]

        try:
            numeric_scaled = self.scaler.transform([numeric_array])
        except Exception as e:
            print(f"⚠️ Scaling error: {e}")
            # Fallback: use unscaled features
            numeric_scaled = np.array([numeric_array])

        # Combine features
        from scipy.sparse import hstack
        X_combined = hstack([text_features, numeric_scaled])

        # Predict
        try:
            prediction = self.model.predict(X_combined)[0]
            return prediction
        except Exception as e:
            print(f"⚠️ Prediction error: {e}")
            # Fallback to rule-based prediction
            return self._fallback_prediction(note_clean, amount)
    
    def _fallback_prediction(self, note_clean, amount):
        """Fallback rule-based prediction"""
        note_lower = note_clean.lower()
        
        # Food keywords (highest priority for food)
        food_keywords = ['chicken', 'food', 'restaurant', 'dining', 'meal', 'naan', 'curry', 'biryani', 'angara']
        if any(keyword in note_lower for keyword in food_keywords):
            return "Food & Dining"
        
        # Transport
        if any(keyword in note_lower for keyword in ['taxi', 'auto', 'transport', 'uber', 'fuel']):
            return "Transportation"
        
        # Bills (specific patterns only)
        if any(keyword in note_lower for keyword in ['electricity', 'internet', 'phone bill', 'utility']):
            return "Bills & Utilities"
        
        return "Miscellaneous"