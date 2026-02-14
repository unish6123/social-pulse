exports.up = (pgm) => {
  // Modify the posts table to allow 'news' as a platform
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

exports.down = (pgm) => {
  // Revert back to only twitter and reddit
  pgm.sql(`
    ALTER TABLE posts 
    DROP CONSTRAINT IF EXISTS posts_platform_check;
  `);
  
  pgm.sql(`
    ALTER TABLE posts
    ADD CONSTRAINT posts_platform_check 
    CHECK (platform IN ('twitter', 'reddit'));
  `);
};