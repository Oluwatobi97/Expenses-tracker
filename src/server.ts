import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool, testConnection } from "./config/database.js";
import { PoolClient, QueryResult } from "pg";
import { SERVER_CONFIG } from "./config/server.config.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Test database connection
testConnection();

const app = express();
app.use(cors());
app.use(express.json());

// Debug information
console.log("Current directory:", process.cwd());
console.log("__dirname:", __dirname);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Determine the correct path for static files
const staticPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "dist")
    : path.join(__dirname, "dist");

console.log("Static files path:", staticPath);

// Check if directory exists
if (fs.existsSync(staticPath)) {
  console.log("Static directory exists");
  // console.log('Contents of static directory:', fs.readdirSync(staticPath)); // Avoid listing too many files in logs
} else {
  console.error("Static directory does not exist!");
}

// Serve static files
app.use(express.static(staticPath));

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const { email, password } = req.body;
    const result: QueryResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const users = result.rows;

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
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Registration attempt for:", { username, email }); // Log registration attempt

  try {
    // Check if user already exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );

    if (userResult.rows.length > 0) {
      console.log("User already exists:", { username, email }); // Log duplicate user
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    console.log("User registered successfully:", result.rows[0]); // Log successful registration
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Registration error details:", error); // Log detailed error
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get transactions endpoint
app.get("/api/transactions/:userId", async (req, res) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const { userId } = req.params;
    const result: QueryResult = await client.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Add transaction endpoint
app.post("/api/transactions", async (req, res) => {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const { user_id, type, amount, date, description } = req.body;
    const result: QueryResult = await client.query(
      "INSERT INTO transactions (user_id, type, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [user_id, type, amount, date, description]
    );
    res.status(201).json({
      id: result.rows[0].id,
      user_id,
      type,
      amount,
      date,
      description,
    });
  } catch (error) {
    console.error("Add transaction error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Serve index.html for all other routes
app.get("*", (_req, res) => {
  const indexPath = path.join(staticPath, "index.html");
  console.log("Attempting to serve index.html from:", indexPath);

  if (fs.existsSync(indexPath)) {
    console.log("index.html exists");
    res.sendFile(indexPath);
  } else {
    console.error("index.html not found!");
    res.status(404).send("index.html not found");
  }
});

const port = process.env.PORT || SERVER_CONFIG.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Static files directory: ${staticPath}`);
});
