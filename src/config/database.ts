import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "my_expenses_tracker",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
export const testConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ MySQL connection successful");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};

export { pool };
