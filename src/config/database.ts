import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Verify environment variables
if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD is not set in .env file");
}

const dbConfig = {
  user: "postgres",
  host: "localhost",
  database: "expense_tracker",
  password: process.env.DB_PASSWORD,
  port: 5432,
};

console.log("Database configuration:", {
  ...dbConfig,
  password: "****", // Mask the password in logs
});

const pool = new Pool(dbConfig);

// Test database connection
export const testConnection = async () => {
  let client;
  try {
    console.log("=== Database Connection Attempt ===");
    console.log("Connection details:", {
      ...dbConfig,
      password: "****",
    });

    console.log("Attempting to connect to PostgreSQL...");
    client = await pool.connect();
    console.log("Connected to PostgreSQL, testing query...");

    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ PostgreSQL connection successful");
    console.log("Current database time:", result.rows[0].current_time);
    console.log("=================================");
  } catch (err: any) {
    console.error("=== PostgreSQL Connection Error ===");
    console.error("Error type:", typeof err);
    console.error("Error details:", {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      detail: err?.detail,
      stack: err?.stack,
    });

    // Check if database exists
    try {
      console.log("Checking if database exists...");
      const tempPool = new Pool({
        ...dbConfig,
        database: "postgres", // Connect to default database
      });
      const tempClient = await tempPool.connect();
      const dbCheck = await tempClient.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbConfig.database]
      );
      if (dbCheck.rows.length === 0) {
        console.error(`Database '${dbConfig.database}' does not exist!`);
      } else {
        console.log(`Database '${dbConfig.database}' exists.`);
      }
      tempClient.release();
      await tempPool.end();
    } catch (checkErr: any) {
      console.error("Error checking database existence:", {
        message: checkErr?.message,
        code: checkErr?.code,
        detail: checkErr?.detail,
      });
    }
    console.error("=================================");

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Handle pool errors
pool.on("error", (err: any) => {
  console.error("=== Pool Error ===");
  console.error("Error details:", {
    name: err?.name,
    message: err?.message,
    code: err?.code,
    detail: err?.detail,
    stack: err?.stack,
  });
  console.error("=================");
  process.exit(-1);
});

export default pool;
