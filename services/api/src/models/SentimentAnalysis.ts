export interface SentimentAnalysis {
  id: number;
  post_id: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  analyzed_at: Date;
}

export interface CreateSentimentDTO {
  post_id: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

export interface SentimentWithPost extends SentimentAnalysis {
  platform: string;
  content: string;
  keyword: string;
}

export interface SentimentStats {
  keyword_id: number;
  keyword: string;
  total_posts: number;
  analyzed_posts: number;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  average_score: number;
  percentages: {
    positive: number;
    negative: number;
    neutral: number;
  };
}