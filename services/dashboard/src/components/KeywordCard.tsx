import { useState, useEffect } from 'react';
import { Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { sentimentAPI } from '../services/api';
import type { SentimentStats } from '../services/api';
import SentimentChart from './SentimentChart';

interface Props {
  keywordId: number;
  keyword: string;
  onDelete: () => void;
}

export default function KeywordCard({ keywordId, keyword, onDelete }: Props) {
  const [stats, setStats] = useState<SentimentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [keywordId]);

  const loadStats = async () => {
    try {
      const response = await sentimentAPI.getStats(keywordId);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${keyword}" and all related data?`)) return;
    
    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting:', error);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!stats) return null;

  const getSentimentIcon = () => {
    if (stats.average_score > 0.2) return <TrendingUp className="text-green-500" />;
    if (stats.average_score < -0.2) return <TrendingDown className="text-red-500" />;
    return <Minus className="text-gray-500" />;
  };

  const getSentimentColor = () => {
    if (stats.average_score > 0.2) return 'text-green-600';
    if (stats.average_score < -0.2) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-2">{keyword}</h3>
            <p className="text-blue-100 text-sm">
              {stats.analyzed_posts} of {stats.total_posts} posts analyzed
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Delete keyword"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        {/* Overall Sentiment */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600 text-sm">Overall Sentiment</p>
            <div className="flex items-center gap-2 mt-1">
              {getSentimentIcon()}
              <span className={`text-3xl font-bold ${getSentimentColor()}`}>
                {stats.average_score > 0 ? '+' : ''}{stats.average_score.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="w-32 h-32">
            <SentimentChart stats={stats} />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">😊 Positive</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentages.positive}%` }}
                ></div>
              </div>
              <span className="font-semibold text-green-600 w-12 text-right">
                {stats.percentages.positive.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">😐 Neutral</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentages.neutral}%` }}
                ></div>
              </div>
              <span className="font-semibold text-gray-600 w-12 text-right">
                {stats.percentages.neutral.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">😢 Negative</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.percentages.negative}%` }}
                ></div>
              </div>
              <span className="font-semibold text-red-600 w-12 text-right">
                {stats.percentages.negative.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.sentiment_breakdown.positive}</p>
            <p className="text-xs text-gray-500">Positive</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.sentiment_breakdown.neutral}</p>
            <p className="text-xs text-gray-500">Neutral</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.sentiment_breakdown.negative}</p>
            <p className="text-xs text-gray-500">Negative</p>
          </div>
        </div>
      </div>
    </div>
  );
}