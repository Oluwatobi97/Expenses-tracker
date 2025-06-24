import dotenv from "dotenv";
import { Pool } from "pg";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

console.log("Testing database connection...");
console.log("Environment variables:", {
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
});

// Create database pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: false,
});

async function testConnection() {
  let client;
  try {
    console.log("Attempting to connect to database...");
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ Database connection successful!");
    console.log("Current database time:", result.rows[0].current_time);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error details:", {
      code: error.code,
      detail: error.detail,
    });
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();
