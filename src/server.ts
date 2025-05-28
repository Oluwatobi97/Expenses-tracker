import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool, testConnection } from "./config/database.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { SERVER_CONFIG } from "./config/server.config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Test database connection
testConnection();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "dist")));

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
      [email, name, hashedPassword]
    );

    res.status(201).json({
      id: result.insertId,
      email,
      name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get transactions endpoint
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [transactions] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
      [userId]
    );
    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add transaction endpoint
app.post("/api/transactions", async (req, res) => {
  try {
    const { user_id, type, amount, date, description } = req.body;
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO transactions (user_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?)",
      [user_id, type, amount, date, description]
    );
    res.status(201).json({
      id: result.insertId,
      user_id,
      type,
      amount,
      date,
      description,
    });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve index.html for all other routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
});
