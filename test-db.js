import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("Testing database connection...");
console.log("Environment variables loaded:", {
  DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
  NODE_ENV: process.env.NODE_ENV,
});

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "expense_tracker",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

async function testConnection() {
  let client;
  try {
    console.log("Attempting to connect...");
    client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Connection successful!");
    console.log("Current time:", result.rows[0].now);
  } catch (err) {
    console.error("Connection failed!");
    console.error("Error details:", {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      detail: err?.detail,
    });
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();
