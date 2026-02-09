import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Keywords
export const getKeywords = async () => {
  const response = await api.get('/api/keywords');
  return response.data;
};

export const createKeyword = async (keyword: string) => {
  const response = await api.post('/api/keywords', { keyword });
  return response.data;
};

// Sentiment Stats
export const getSentimentStats = async (keywordId: number) => {
  const response = await api.get(`/api/sentiment/stats/keyword/${keywordId}`);
  return response.data;
};

// Posts
export const getPostsByKeyword = async (keywordId: number) => {
  const response = await api.get(`/api/posts/keyword/${keywordId}`);
  return response.data;
};

export default api;