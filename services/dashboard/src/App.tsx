import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Activity } from 'lucide-react';
import KeywordCard from './components/KeywordCard';
import AddKeywordModal from './components/AddKeywordModal';
import { keywordsAPI } from './services/api';
import type { Keyword } from './services/api';

function App() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const response = await keywordsAPI.getAll();
      setKeywords(response.data);
    } catch (error) {
      console.error('Error loading keywords:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddKeyword = async (keyword: string) => {
    await keywordsAPI.create(keyword);
    await loadKeywords();
  };

  const handleDeleteKeyword = async (id: number) => {
    await keywordsAPI.delete(id);
    await loadKeywords();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadKeywords();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Activity className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Social Pulse
                </h1>
                <p className="text-gray-600">Real-time Sentiment Analysis</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Add Keyword
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {keywords.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <Activity size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Keywords Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Add your first keyword to start monitoring sentiment!
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Keyword
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keywords.map((keyword) => (
              <KeywordCard
                key={keyword.id}
                keywordId={keyword.id}
                keyword={keyword.keyword}
                onDelete={() => handleDeleteKeyword(keyword.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <AddKeywordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddKeyword}
      />
    </div>
  );
}

export default App;