import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const NYTIMES_API_KEY = process.env.NYTIMES_API_KEY;
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL || '1800') * 1000;
const ARTICLES_PER_KEYWORD = parseInt(process.env.ARTICLES_PER_KEYWORD || '10');

interface Keyword {
  id: number;
  keyword: string;
  is_active: boolean;
}

interface NYTimesArticle {
  headline: {
    main: string;
  };
  abstract: string;
  web_url: string;
  pub_date: string;
  source: string;
  byline?: {
    original?: string;
  };
}

class NYTimesIngestor {
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

  async fetchArticlesForKeyword(keyword: string): Promise<NYTimesArticle[]> {
    try {
      const response = await axios.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', {
        params: {
          q: keyword,
          'api-key': NYTIMES_API_KEY,
          sort: 'newest',
          page: 0,
        },
      });

      const articles = response.data.response?.docs || [];
      return articles.slice(0, ARTICLES_PER_KEYWORD);
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.error(`⚠️  Rate limit hit for "${keyword}" - waiting...`);
      } else {
        console.error(`❌ Error fetching articles for "${keyword}":`, error.message);
      }
      return [];
    }
  }

  async savePost(article: NYTimesArticle, keywordId: number): Promise<boolean> {
    try {
      const externalId = article.web_url;

      if (this.processedArticles.has(externalId)) {
        return false;
      }

      if (!article.headline?.main || !article.web_url) {
        return false;
      }

      // Combine headline and abstract
      const content = article.abstract && article.abstract.trim()
        ? `${article.headline.main}. ${article.abstract}`
        : article.headline.main;

      if (content.length < 10) {
        return false;
      }

      // Extract author from byline
      const author = article.byline?.original || article.source || 'The New York Times';

      await axios.post(`${API_URL}/posts`, {
        platform: 'nytimes',
        external_id: externalId,
        author: author,
        content: content,
        keyword_id: keywordId,
        posted_at: article.pub_date,
      });

      this.processedArticles.add(externalId);
      return true;
    } catch (error: any) {
      if (error.response?.status === 409 || error.response?.data?.error?.includes('duplicate')) {
        this.processedArticles.add(article.web_url);
        return false;
      }

      if (error.response?.status === 400) {
        console.error(`  ⚠️  Skipping article: ${error.response?.data?.error || 'Invalid data'}`);
      } else {
        console.error('❌ Error saving post:', error.message);
      }
      return false;
    }
  }

  async processBatch(): Promise<void> {
    console.log('\n🔄 Starting NY Times ingestion cycle...');
    
    const keywords = await this.getActiveKeywords();
    
    if (keywords.length === 0) {
      console.log('⏳ No active keywords found. Waiting...');
      return;
    }

    console.log(`📋 Found ${keywords.length} active keywords: ${keywords.map(k => k.keyword).join(', ')}`);

    let totalArticles = 0;
    let savedArticles = 0;

    for (const keyword of keywords) {
      console.log(`\n🔍 Fetching NY Times articles for: "${keyword.keyword}"`);
      
      const articles = await this.fetchArticlesForKeyword(keyword.keyword);
      totalArticles += articles.length;

      console.log(`  📰 Found ${articles.length} articles`);

      for (const article of articles) {
        const saved = await this.savePost(article, keyword.id);
        if (saved) {
          savedArticles++;
          console.log(`  ✓ Saved: ${article.headline.main.substring(0, 60)}...`);
        }
      }

      // Delay to respect rate limits (4 requests/second = 250ms delay)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Cycle complete: ${savedArticles} new articles saved (${totalArticles} total fetched)`);
    console.log(`⏰ Next cycle in ${FETCH_INTERVAL / 1000 / 60} minutes`);
  }

  async run(): Promise<void> {
    console.log('🗞️  NY Times Ingestor starting...');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`⏱️  Fetch interval: ${FETCH_INTERVAL / 1000 / 60} minutes`);
    console.log(`📊 Articles per keyword: ${ARTICLES_PER_KEYWORD}\n`);

    await this.processBatch();
    setInterval(() => this.processBatch(), FETCH_INTERVAL);
  }
}

const ingestor = new NYTimesIngestor();
ingestor.run().catch(console.error);