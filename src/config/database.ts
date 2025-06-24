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

// Parse connection string if available
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432"),
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    };

// Verify required environment variables
const requiredEnvVars = process.env.DATABASE_URL
  ? ["DATABASE_URL"]
  : ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

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
    } catch (err: any) {
      retries++;
      console.error(`Database connection attempt ${retries} failed:`, {
        error: err.message,
        code: err.code,
        host:
          dbConfig.host ||
          (dbConfig.connectionString ? "from connection string" : "undefined"),
        database:
          dbConfig.database ||
          (dbConfig.connectionString ? "from connection string" : "undefined"),
        user:
          dbConfig.user ||
          (dbConfig.connectionString ? "from connection string" : "undefined"),
      });

      if (retries === maxRetries) {
        console.error("Max retries reached. Could not connect to database.");
        throw err;
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
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

    // Try to establish connection with retries
    await retryConnection();

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
        [
          dbConfig.database ||
            (dbConfig.connectionString
              ? "from connection string"
              : "undefined"),
        ]
      );
      if (dbCheck.rows.length === 0) {
        console.error(
          `Database '${
            dbConfig.database || "from connection string"
          }' does not exist!`
        );
      } else {
        console.log(
          `Database '${dbConfig.database || "from connection string"}' exists.`
        );
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
  // Don't exit the process, just log the error
  // process.exit(-1);
});

export default pool;
