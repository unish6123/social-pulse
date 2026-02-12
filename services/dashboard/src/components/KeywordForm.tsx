import { useState } from 'react';
import { createKeyword } from '../services/api';

interface Props {
  onKeywordCreated: () => void;
}

function KeywordForm({ onKeywordCreated }: Props) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      setError('Keyword cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createKeyword(keyword.trim());
      setKeyword('');
      onKeywordCreated(); // Refresh the keywords list
    } catch (err) {
      setError('Failed to create keyword. It may already exist.');
      console.error('Error creating keyword:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>Add New Keyword</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword (e.g., Apple, ChatGPT)"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={loading}
          />
          {error && <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '14px' }}>{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Adding...' : 'Add Keyword'}
        </button>
      </form>
    </div>
  );
}

export default KeywordForm;