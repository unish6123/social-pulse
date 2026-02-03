export interface Keyword {
  id: number;
  keyword: string;
  is_active: boolean;
  created_at: Date;
}

export interface CreateKeywordDTO {
  keyword: string;
}