import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL || '1800') * 1000;
const ARTICLES_PER_KEYWORD = parseInt(process.env.ARTICLES_PER_KEYWORD || '20');

interface Keyword {
  id: number;
  keyword: string;
  is_active: boolean;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

class NewsIngestor {
  private processedArticles = new Set<string>();

  async getActiveKeywords(): Promise<Keyword[]> {
    try {
      const response = await axios.get(`${API_URL}/keywords/active`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching keywords:', error);
      return [];
    }
  }

  async fetchNewsForKeyword(keyword: string): Promise<NewsArticle[]> {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: keyword,
          apiKey: NEWS_API_KEY,
          pageSize: ARTICLES_PER_KEYWORD,
          language: 'en',
          sortBy: 'publishedAt',
        },
      });

      return response.data.articles || [];
    } catch (error: any) {
      console.error(`❌ Error fetching news for "${keyword}":`, error.message);
      return [];
    }
  }

  async savePost(article: NewsArticle, keywordId: number): Promise<boolean> {
  try {
    // Use URL as external_id to prevent duplicates
    const externalId = article.url;

    // Skip if already processed
    if (this.processedArticles.has(externalId)) {
      return false;
    }

    // Skip if no title or URL
    if (!article.title || !article.url) {
      return false;
    }

    // Combine title and description for content
    // Handle null/empty descriptions
    const content = article.description && article.description.trim()
      ? `${article.title}. ${article.description}`
      : article.title;

    // Skip if content is too short (less than 10 chars)
    if (content.length < 10) {
      return false;
    }

    await axios.post(`${API_URL}/posts`, {
      platform: 'news',
      external_id: externalId,
      author: article.source?.name || 'Unknown',
      content: content,
      keyword_id: keywordId,
      posted_at: article.publishedAt || new Date().toISOString(),
    });

    this.processedArticles.add(externalId);
    return true;
  } catch (error: any) {
    // Ignore duplicate errors (post already exists)
    if (error.response?.status === 409 || error.response?.data?.error?.includes('duplicate')) {
      this.processedArticles.add(article.url);
      return false;
    }
    
    // Log detailed error for debugging
    if (error.response?.status === 400) {
      console.error(`  ⚠️  Skipping article: ${error.response?.data?.error || 'Invalid data'}`);
    } else {
      console.error('❌ Error saving post:', error.message);
    }
    return false;
  }
}


  async processBatch(): Promise<void> {
    console.log('\n🔄 Starting news ingestion cycle...');
    
    const keywords = await this.getActiveKeywords();
    
    if (keywords.length === 0) {
      console.log('⏳ No active keywords found. Waiting...');
      return;
    }

    console.log(`📋 Found ${keywords.length} active keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    let totalArticles = 0;
    let savedArticles = 0;

    for (const keyword of keywords) {
      console.log(`\n🔍 Fetching news for: "${keyword.keyword}"`);
      
      const articles = await this.fetchNewsForKeyword(keyword.keyword);
      totalArticles += articles.length;

      console.log(`  📰 Found ${articles.length} articles`);

      for (const article of articles) {
        const saved = await this.savePost(article, keyword.id);
        if (saved) {
          savedArticles++;
          console.log(`  ✓ Saved: ${article.title.substring(0, 60)}...`);
        }
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Cycle complete: ${savedArticles} new articles saved (${totalArticles} total fetched)`);
    console.log(`⏰ Next cycle in ${FETCH_INTERVAL / 1000 / 60} minutes`);
  }

  async run(): Promise<void> {
    console.log('🚀 News Ingestor starting...');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`⏱️  Fetch interval: ${FETCH_INTERVAL / 1000 / 60} minutes`);
    console.log(`📊 Articles per keyword: ${ARTICLES_PER_KEYWORD}\n`);

    // Run immediately on start
    await this.processBatch();

    // Then run on interval
    setInterval(() => this.processBatch(), FETCH_INTERVAL);
  }
}

// Start the ingestor
const ingestor = new NewsIngestor();
ingestor.run().catch(console.error);