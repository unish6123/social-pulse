exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE posts 
    DROP CONSTRAINT IF EXISTS posts_platform_check;
  `);
  
  pgm.sql(`
    ALTER TABLE posts
    ADD CONSTRAINT posts_platform_check 
    CHECK (platform IN ('twitter', 'reddit', 'news', 'nytimes'));
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE posts 
    DROP CONSTRAINT IF EXISTS posts_platform_check;
  `);
  
  pgm.sql(`
    ALTER TABLE posts
    ADD CONSTRAINT posts_platform_check 
    CHECK (platform IN ('twitter', 'reddit', 'news'));
  `);
};