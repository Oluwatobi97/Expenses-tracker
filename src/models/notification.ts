import pool from "../config/db.config.js";
import { Notification } from "../types/index.js";

export async function createNotification(
  user_id: number,
  message: string
): Promise<Notification> {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, message) VALUES ($1, $2) RETURNING *`,
    [user_id, message]
  );
  return result.rows[0];
}

export async function getAllNotifications(): Promise<Notification[]> {
  const result = await pool.query(
    `SELECT * FROM notifications ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function replyToNotification(
  id: number,
  reply: string
): Promise<Notification> {
  const result = await pool.query(
    `UPDATE notifications SET reply = $1, replied_at = NOW(), read = TRUE WHERE id = $2 RETURNING *`,
    [reply, id]
  );
  return result.rows[0];
}

export async function getUserNotifications(
  user_id: number
): Promise<Notification[]> {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
}
