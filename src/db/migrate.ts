import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export async function runMigrations() {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query("BEGIN");

    // Read and execute migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "001_initial_schema.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration...");
    await client.query(migrationSQL);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Migration completed successfully");
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Only run migrations directly if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("All migrations completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
