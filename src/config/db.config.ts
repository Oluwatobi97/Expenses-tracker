import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Log environment variables (without sensitive data)
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PORT: process.env.DB_PORT,
  DB_PASSWORD_SET: !!process.env.DB_PASSWORD,
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  PORT: process.env.PORT,
  JWT_SECRET_SET: !!process.env.JWT_SECRET,
});

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.SSL_ENABLED === "true" ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

// Log configuration (without sensitive data)
console.log("Database configuration:", {
  ...dbConfig,
  password: "****",
});

// Create the pool
const pool = new Pool(dbConfig);

// Test the connection
pool.on("connect", () => {
  console.log("Database connected successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export default pool;
