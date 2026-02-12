import { useState, useEffect } from 'react';
import { getKeywords, getSentimentStats } from '../services/api';
import type { Keyword, SentimentStats } from '../types';
import SentimentChart from '../components/SentimentChart';
import KeywordForm from '../components/KeywordForm';

function Dashboard() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<number | null>(null);
  const [stats, setStats] = useState<SentimentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const data = await getKeywords();
      setKeywords(data);
      if (data.length > 0) {
        setSelectedKeyword(data[0].id);
        loadStats(data[0].id);
      }
    } catch (error) {
      console.error('Error loading keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (keywordId: number) => {
    try {
      const data = await getSentimentStats(keywordId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleKeywordChange = (keywordId: number) => {
    setSelectedKeyword(keywordId);
    loadStats(keywordId);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Social Pulse Dashboard</h1>
      
      <KeywordForm onKeywordCreated={loadKeywords} />
      {/* Keyword Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label>Select Keyword: </label>
        <select 
          value={selectedKeyword || ''} 
          onChange={(e) => handleKeywordChange(Number(e.target.value))}
        >
          {keywords.map((keyword) => (
            <option key={keyword.id} value={keyword.id}>
              {keyword.keyword}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Display */}
      {stats && (
        <div>
          <h2>Stats for: {stats.keyword}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Total Posts</h3>
              <p style={{ fontSize: '32px', margin: 0 }}>{stats.total_posts}</p>
            </div>
            
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Analyzed Posts</h3>
              <p style={{ fontSize: '32px', margin: 0 }}>{stats.analyzed_posts}</p>
            </div>
            
            <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Average Score</h3>
              <p style={{ fontSize: '32px', margin: 0 }}>{stats.average_score.toFixed(2)}</p>
            </div>
          </div>

          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Sentiment Breakdown</h3>
            
            {/* Pie Chart */}
            <SentimentChart stats={stats} />
            
            {/* Bar visualization */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <div style={{ flex: 1 }}>
                <p>Positive: {stats.sentiment_breakdown.positive} ({stats.percentages.positive}%)</p>
                <div style={{ 
                  height: '20px', 
                  background: '#4caf50', 
                  width: `${stats.percentages.positive}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              
              <div style={{ flex: 1 }}>
                <p>Negative: {stats.sentiment_breakdown.negative} ({stats.percentages.negative}%)</p>
                <div style={{ 
                  height: '20px', 
                  background: '#f44336', 
                  width: `${stats.percentages.negative}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
              
              <div style={{ flex: 1 }}>
                <p>Neutral: {stats.sentiment_breakdown.neutral} ({stats.percentages.neutral}%)</p>
                <div style={{ 
                  height: '20px', 
                  background: '#9e9e9e', 
                  width: `${stats.percentages.neutral}%`,
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;