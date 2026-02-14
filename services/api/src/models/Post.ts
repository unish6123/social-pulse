export interface Post {
  id: number;
  platform: 'twitter' | 'reddit' | 'news';
  external_id: string;
  author: string;
  content: string;
  keyword_id: number;
  posted_at: Date;
  created_at: Date;
}

export interface CreatePostDTO {
  platform: 'twitter' | 'reddit';
  external_id: string;
  author: string;
  content: string;
  keyword_id: number;
  posted_at: Date;
}

export interface PostWithKeyword extends Post {
  keyword: string;
}