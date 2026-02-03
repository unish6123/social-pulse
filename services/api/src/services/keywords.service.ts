import pool from '../config/database';
import { Keyword, CreateKeywordDTO } from '../models/Keyword';

export const getAllKeywords = async (): Promise<Keyword[]> => {
  const result = await pool.query(
    'SELECT * FROM keywords ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getActiveKeywords = async (): Promise<Keyword[]> => {
  const result = await pool.query(
    'SELECT * FROM keywords WHERE is_active = true ORDER BY created_at DESC'
  );
  return result.rows;
};

export const createKeyword = async (
  data: CreateKeywordDTO
): Promise<Keyword> => {
  const result = await pool.query(
    'INSERT INTO keywords (keyword) VALUES ($1) RETURNING *',
    [data.keyword]
  );
  return result.rows[0];
};

export const deleteKeyword = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM keywords WHERE id = $1', [id]);
};