import time
import psycopg
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from redis import Redis
from config import (
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
    REDIS_HOST, REDIS_PORT, BATCH_SIZE, SLEEP_INTERVAL
)

class SentimentProcessor:
    def __init__(self):
        # Initialize VADER sentiment analyzer
        self.analyzer = SentimentIntensityAnalyzer()
        
        # Database connection string
        self.db_conn_string = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD}"
        
        # Redis connection
        self.redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
        
        print("✅ Sentiment Processor initialized")
        print(f"📊 Processing {BATCH_SIZE} posts every {SLEEP_INTERVAL} seconds")
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment of text using VADER
        Returns: (sentiment_label, score)
        """
        scores = self.analyzer.polarity_scores(text)
        compound = scores['compound']
        
        # Classify based on compound score
        if compound >= 0.05:
            return 'positive', compound
        elif compound <= -0.05:
            return 'negative', compound
        else:
            return 'neutral', compound
    
    def get_unanalyzed_posts(self, conn):
        """Get posts that haven't been analyzed yet"""
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.id, p.content, p.keyword_id
                FROM posts p
                LEFT JOIN sentiment_analysis sa ON p.id = sa.post_id
                WHERE sa.id IS NULL
                LIMIT %s
            """, (BATCH_SIZE,))
            return cur.fetchall()
    
    def save_sentiment(self, conn, post_id, sentiment, score):
        """Save sentiment analysis to database"""
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO sentiment_analysis (post_id, sentiment, score)
                VALUES (%s, %s, %s)
                ON CONFLICT (post_id) DO NOTHING
            """, (post_id, sentiment, score))
    
    def invalidate_cache(self, keyword_id):
        """Invalidate Redis cache for the keyword"""
        cache_key = f"sentiment:stats:keyword:{keyword_id}"
        self.redis_client.delete(cache_key)
        print(f"🗑️  Cache invalidated: {cache_key}")
    
    def process_batch(self):
        """Process a batch of unanalyzed posts"""
        try:
            with psycopg.connect(self.db_conn_string) as conn:
                # Get unanalyzed posts
                posts = self.get_unanalyzed_posts(conn)
                
                if not posts:
                    print("⏳ No unanalyzed posts found. Waiting...")
                    return 0
                
                print(f"\n📝 Processing {len(posts)} posts...")
                processed = 0
                
                for post_id, content, keyword_id in posts:
                    # Analyze sentiment
                    sentiment, score = self.analyze_sentiment(content)
                    
                    # Save to database
                    self.save_sentiment(conn, post_id, sentiment, score)
                    
                    # Invalidate cache
                    self.invalidate_cache(keyword_id)
                    
                    processed += 1
                    print(f"  ✓ Post {post_id}: {sentiment} ({score:.2f})")
                
                conn.commit()
                print(f"✅ Processed {processed} posts")
                return processed
                
        except Exception as e:
            print(f"❌ Error processing batch: {e}")
            return 0
    
    def run(self):
        """Main processing loop"""
        print("\n🚀 Starting sentiment processor...\n")
        
        try:
            while True:
                self.process_batch()
                time.sleep(SLEEP_INTERVAL)
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping processor...")
            print("👋 Goodbye!")

if __name__ == "__main__":
    processor = SentimentProcessor()
    processor.run()