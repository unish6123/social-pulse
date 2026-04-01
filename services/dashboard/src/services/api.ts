import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Keyword {
  id: number;
  keyword: string;
  is_active: boolean;
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

export const keywordsAPI = {
  getAll: () => api.get<Keyword[]>('/keywords'),
  create: (keyword: string) => api.post<Keyword>('/keywords', { keyword }),
  delete: (id: number) => api.delete(`/keywords/${id}`),
};

export const sentimentAPI = {
  getStats: (keywordId: number) => api.get<SentimentStats>(`/sentiment/stats/keyword/${keywordId}`),
};

export default api;