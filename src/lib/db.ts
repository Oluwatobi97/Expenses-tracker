import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.SSL_ENABLED === "true" ? { rejectUnauthorized: false } : false,
});

export const connectDB = async () => {
  try {
    const connection = await pool.connect();
    console.log("PostgreSQL connected successfully");
    connection.release();
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

export { pool };
