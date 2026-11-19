import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool;
try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.SSL_ENABLED === "true" ? { rejectUnauthorized: false } : false,
  });
} catch {
  console.warn("[AI Studio] DB not connected in lib/db.ts — mock active");
  pool = {
    query: async () => ({ rows: [], rowCount: 0 }),
    connect: async () => ({ query: async () => ({ rows: [], rowCount: 0 }), release: () => {} }),
  } as unknown as Pool;
}

export const connectDB = async () => {
  try {
    const connection = await pool.connect();
    console.log("PostgreSQL connected successfully");
    connection.release();
  } catch (error) {
    console.warn("PostgreSQL connection error — running with mock:", error);
  }
};

export { pool };
