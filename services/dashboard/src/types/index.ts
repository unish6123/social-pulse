export interface Keyword {
  id: number;
  keyword: string;
  is_active: boolean;
  created_at: string;
}

export interface Post {
  id: number;
  platform: string;
  external_id: string;
  author: string;
  content: string;
  keyword_id: number;
  posted_at: string;
  created_at: string;
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