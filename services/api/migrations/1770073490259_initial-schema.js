exports.up = (pgm) => {
  // Create keywords table
  pgm.createTable('keywords', {
    id: 'id',
    keyword: { type: 'varchar(255)', notNull: true, unique: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Create posts table
  pgm.createTable('posts', {
    id: 'id',
    platform: { type: 'varchar(50)', notNull: true }, // 'twitter' or 'reddit'
    external_id: { type: 'varchar(255)', notNull: true }, // Platform's post ID
    author: { type: 'varchar(255)', notNull: true },
    content: { type: 'text', notNull: true },
    keyword_id: {
      type: 'integer',
      notNull: true,
      references: '"keywords"',
      onDelete: 'CASCADE',
    },
    posted_at: { type: 'timestamp', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Create sentiment_analysis table
  pgm.createTable('sentiment_analysis', {
    id: 'id',
    post_id: {
      type: 'integer',
      notNull: true,
      references: '"posts"',
      onDelete: 'CASCADE',
      unique: true,
    },
    sentiment: { type: 'varchar(20)', notNull: true }, // 'positive', 'negative', 'neutral'
    score: { type: 'decimal(3,2)', notNull: true }, // -1.00 to 1.00
    analyzed_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Create indexes for better query performance
  pgm.createIndex('posts', 'keyword_id');
  pgm.createIndex('posts', 'platform');
  pgm.createIndex('posts', 'posted_at');
  pgm.createIndex('sentiment_analysis', 'post_id');
  pgm.createIndex('sentiment_analysis', 'sentiment');
};

exports.down = (pgm) => {
  // Drop tables in reverse order (due to foreign keys)
  pgm.dropTable('sentiment_analysis');
  pgm.dropTable('posts');
  pgm.dropTable('keywords');
};