import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "my_expenses_tracker_pg",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Test database connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("✅ PostgreSQL connection successful");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err);
  }
};

export { pool };
