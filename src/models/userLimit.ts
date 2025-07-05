import pool from "../config/db.config.js";
import { UserLimit, CreateUserLimitRequest } from "../types/index.js";

export async function getUserLimit(user_id: number): Promise<UserLimit | null> {
  const result = await pool.query(
    `SELECT * FROM user_limits WHERE user_id = $1`,
    [user_id]
  );
  return result.rows[0] || null;
}

export async function createOrUpdateUserLimit(
  user_id: number,
  limitData: CreateUserLimitRequest
): Promise<UserLimit> {
  const {
    daily_limit,
    monthly_limit,
    daily_limit_enabled,
    monthly_limit_enabled,
  } = limitData;

  const result = await pool.query(
    `INSERT INTO user_limits (user_id, daily_limit, monthly_limit, daily_limit_enabled, monthly_limit_enabled)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) 
     DO UPDATE SET 
       daily_limit = EXCLUDED.daily_limit,
       monthly_limit = EXCLUDED.monthly_limit,
       daily_limit_enabled = EXCLUDED.daily_limit_enabled,
       monthly_limit_enabled = EXCLUDED.monthly_limit_enabled,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [
      user_id,
      daily_limit,
      monthly_limit,
      daily_limit_enabled,
      monthly_limit_enabled,
    ]
  );

  return result.rows[0];
}

export async function deleteUserLimit(user_id: number): Promise<void> {
  await pool.query(`DELETE FROM user_limits WHERE user_id = $1`, [user_id]);
}
