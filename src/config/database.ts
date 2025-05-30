import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables only in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const pool = new Pool({
  host: process.env.DB_HOST, // Rely on Render env var
  user: process.env.DB_USER, // Rely on Render env var
  password: process.env.DB_PASSWORD, // Rely on Render env var
  database: process.env.DB_NAME, // Rely on Render env var
  port: parseInt(process.env.DB_PORT || "5432"), // Port might still need a default if not explicitly set in Render
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
    console.error("DB_HOST:", process.env.DB_HOST);
    console.error("DB_PORT:", process.env.DB_PORT);
    console.error("DB_USER:", process.env.DB_USER);
    console.error("DB_NAME:", process.env.DB_NAME);
  }
};

export { pool };
