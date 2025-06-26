import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Log all relevant environment variables (masking sensitive data)
console.log("Environment variables check:", {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  SSL_ENABLED: process.env.NODE_ENV === "production",
});

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.SSL_ENABLED === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

console.log("Database configuration:", {
  ...dbConfig,
  password: "****",
  connectionString: dbConfig.connectionString ? "****" : undefined,
  ssl: dbConfig.ssl ? "enabled" : "disabled",
});

const pool = new Pool(dbConfig);

// Retry connection function
const retryConnection = async (maxRetries = 5, delay = 5000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      console.log(
        `Attempting database connection (attempt ${
          retries + 1
        }/${maxRetries})...`
      );
      const client = await pool.connect();
      console.log("✅ Database connection successful!");
      client.release();
      return true;
    } catch (err) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, err);
      if (retries === maxRetries) {
        console.error("Max retries reached. Could not connect to database.");
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
};

// Test database connection
export const testConnection = async () => {
  let client;
  try {
    console.log("=== Database Connection Attempt ===");
    console.log("Connection details:", {
      ...dbConfig,
      password: "****",
      connectionString: dbConfig.connectionString ? "****" : undefined,
      ssl: dbConfig.ssl ? "enabled" : "disabled",
    });
    await retryConnection();
    console.log("Attempting to connect to PostgreSQL...");
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ PostgreSQL connection successful");
    console.log("Current database time:", result.rows[0].current_time);
    console.log("=================================");
  } catch (err) {
    console.error("=== PostgreSQL Connection Error ===");
    console.error("Error type:", typeof err);
    console.error("Error details:", err);
    console.error("=================================");
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Handle pool errors
pool.on("error", (err) => {
  console.error("=== Pool Error ===");
  console.error("Error details:", err);
});

export default pool;
