SentiAI — Sentiment Analysis Chatbot
Full-stack ML-powered sentiment analysis chatbot with a beautiful React frontend and FastAPI backend.ML Model Details
Primary: DistilBERT SST-2

Model: distilbert-base-uncased-finetuned-sst-2-english
Training: Fine-tuned on Stanford Sentiment Treebank (SST-2)
Accuracy: ~91% on SST-2 benchmark
Input: Max 512 tokens

Fallback: Rule-Based Pipeline

Lexicon of 80+ positive / 60+ negative words
Negation handling (not, never, no, neither)
Intensity modifiers (very, extremely, barely)
No external dependencies

Emotion Detection (Custom)

8 emotion categories based on Plutchik's Wheel of Emotions
Keyword matching against curated lexicons
Returns top 3 detected emotions

Tone Analysis

Pattern matching for sarcasm, enthusiasm, gratitude
Based on punctuation + sentiment + keyword signals


Features

✅ Real ML model (DistilBERT) with rule-based fallback
✅ Confidence scores for positive/negative/neutral
✅ 8-emotion detection (joy, anger, sadness, fear, surprise, disgust, anticipation, trust)
✅ Tone analysis (enthusiastic, sarcastic, disappointed, etc.)
✅ Keyword extraction
✅ Batch analysis (up to 20 texts)
✅ Beautiful animated React UI with dark theme
✅ Live API status indicator
✅ Quick example prompts
✅ Animated confidence score bars
✅ CORS enabled for local dev
