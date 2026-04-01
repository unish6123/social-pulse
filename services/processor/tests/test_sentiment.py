"""
Sentiment Analysis Tests
Simple tests that don't require database connection
"""
import pytest


def get_sentiment_label(score: float) -> str:
    """Classify sentiment based on compound score"""
    if score >= 0.05:
        return 'positive'
    elif score <= -0.05:
        return 'negative'
    else:
        return 'neutral'


class TestSentimentAnalysis:
    def test_positive_sentiment(self):
        """Test positive sentiment classification"""
        score = 0.8
        result = get_sentiment_label(score)
        assert result == 'positive'
    
    def test_negative_sentiment(self):
        """Test negative sentiment classification"""
        score = -0.8
        result = get_sentiment_label(score)
        assert result == 'negative'
    
    def test_neutral_sentiment(self):
        """Test neutral sentiment classification"""
        score = 0.02
        result = get_sentiment_label(score)
        assert result == 'neutral'
    
    def test_boundary_positive(self):
        """Test positive boundary at 0.05"""
        score = 0.05
        result = get_sentiment_label(score)
        assert result == 'positive'
    
    def test_boundary_negative(self):
        """Test negative boundary at -0.05"""
        score = -0.05
        result = get_sentiment_label(score)
        assert result == 'negative'
    
    def test_zero_is_neutral(self):
        """Test that zero score is neutral"""
        score = 0.0
        result = get_sentiment_label(score)
        assert result == 'neutral'
