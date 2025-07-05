import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "./config/db.config.js";
import { PoolClient } from "pg";
import { SERVER_CONFIG } from "./config/server.config.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { runMigrations } from "./db/migrate.js";
import {
  createNotification,
  getAllNotifications,
  replyToNotification,
  getUserNotifications,
} from "./models/notification.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Debug: Log environment variables (excluding sensitive data)
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

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("=== Unhandled Rejection Details ===");
  console.error("Promise:", promise);
  console.error("Reason type:", typeof reason);

  if (reason instanceof Error) {
    console.error("Error name:", reason.name);
    console.error("Error message:", reason.message);
    console.error("Error stack:", reason.stack);
  } else if (typeof reason === "object" && reason !== null) {
    try {
      console.error("Reason object:", JSON.stringify(reason, null, 2));
    } catch (e) {
      console.error("Reason object (raw):", reason);
    }
    // Type assertion for stack property
    const reasonWithStack = reason as { stack?: string };
    if (reasonWithStack.stack) {
      console.error("Stack:", reasonWithStack.stack);
    }
  } else {
    console.error("Reason:", reason);
  }
  console.error("=================================");
});

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Initialize database connection
let isDatabaseConnected = false;

// Test database connection
async function testDbConnection() {
  let client;
  try {
    console.log("Testing database connection...");
    client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("Database connection successful:", result.rows[0]);
    isDatabaseConnected = true;
  } catch (err) {
    console.error("Database connection failed:", err);
    isDatabaseConnected = false;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Initialize server
async function startServer() {
  try {
    console.log("Starting server initialization...");
    console.log("Environment:", process.env.NODE_ENV);

    // Run migrations in production
    if (process.env.NODE_ENV === "production") {
      console.log("Running database migrations...");
      try {
        await runMigrations();
        console.log("Database migrations completed successfully");
      } catch (error) {
        console.error("Database migration failed:", error);
        // Continue server startup even if migration fails
      }
    }

    // Test database connection
    await testDbConnection();

    if (!isDatabaseConnected) {
      console.error(
        "Failed to connect to database. Server will start but database features will be unavailable."
      );
    }

    // Start server
    const port = process.env.PORT || SERVER_CONFIG.PORT;
    app.listen(port, () => {
      console.log("=== Server Started Successfully ===");
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(
        `Database connection status: ${
          isDatabaseConnected ? "Connected" : "Disconnected"
        }`
      );
      console.log("=================================");
    });
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error("Fatal error during server startup:", error);
  process.exit(1);
});

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
} else {
  console.error("Static directory does not exist!");
}

// Serve static files
app.use(express.static(staticPath));

// Add a test endpoint to verify database connection
app.get("/api/test-db", async (_req: Request, res: Response) => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    res.json({
      message: "Database connection successful",
      timestamp: result.rows[0].current_time,
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error?.message || "Unknown error",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Add a test endpoint to verify server is running
app.get("/api/test", (_req: Request, res: Response) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    database: isDatabaseConnected ? "Connected" : "Disconnected",
  });
});

// Login endpoint
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", { email });

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["email", "password"],
      });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      console.log("User not found:", { email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log("Invalid password for user:", { email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    console.log("User logged in successfully:", { email });
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Login error details:", error);
    res.status(500).json({
      message: "Login failed",
      error: error?.message || "Unknown error",
    });
  }
});

// Register endpoint
app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { username: name, email, password } = req.body;
  console.log("Registration attempt for:", { name, email });

  try {
    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields:", { name, email, password });
      return res.status(400).json({
        message: "Missing required fields",
        required: ["username", "email", "password"],
      });
    }

    // Check if user already exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE name = $1 OR email = $2",
      [name, email]
    );

    if (userResult.rows.length > 0) {
      console.log("User already exists:", { name, email });
      return res.status(400).json({
        message: "User already exists",
        field: userResult.rows[0].email === email ? "email" : "username",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    console.log("User registered successfully:", result.rows[0]);
    res.status(201).json({
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error("Registration error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Registration failed",
      error: error.message || "Unknown error",
      details: error.detail || null,
    });
  }
});

// Get transactions endpoint
app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const { userId } = req.params;
    const result = await client.query(
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
app.post("/api/transactions", async (req: Request, res: Response) => {
  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    const { user_id, type, amount, date, description } = req.body;
    const result = await client.query(
      "INSERT INTO transactions (user_id, type, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [user_id, type, amount, date, description]
    );

    // Check limits after adding transaction (only for expenses)
    if (type === "expense") {
      try {
        // Get all user transactions to check against limits
        const transactionsResult = await client.query(
          "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
          [user_id]
        );
        await checkLimits(Number(user_id), transactionsResult.rows);
      } catch (limitError) {
        console.error("Limit check error:", limitError);
        // Don't fail the transaction if limit check fails
      }
    }

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

// Admin endpoint to get all users
app.get("/api/admin/users", async (req: Request, res: Response) => {
  let client: PoolClient | null = null;
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    ) as any;

    // Check if the user is admin
    if (decoded.email !== "victortobi2000@gmail.com") {
      return res.status(403).json({ message: "Admin access required" });
    }

    client = await pool.connect();

    // Get all users with their transaction counts and subscription status
    const result = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.active,
        u.created_at,
        COUNT(t.id) as transaction_count,
        CASE 
          WHEN COUNT(t.id) > 10 THEN true 
          ELSE false 
        END as has_subscription
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      GROUP BY u.id, u.name, u.email, u.active, u.created_at
      ORDER BY u.created_at DESC
    `);

    // Transform the data to match the frontend expectations
    const users = result.rows.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      subscribed: user.has_subscription,
      active: user.active,
      createdAt: user.created_at,
      transactionCount: parseInt(user.transaction_count),
    }));

    res.json(users);
  } catch (error: any) {
    console.error("Admin get users error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Admin endpoint to toggle user status (block/unblock)
app.put("/api/admin/users/:userId/status", async (req, res) => {
  let client: PoolClient | null = null;
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    ) as any;

    // Check if the user is admin
    if (decoded.email !== "victortobi2000@gmail.com") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { active } = req.body;
    client = await pool.connect();
    const result = await client.query(
      "UPDATE users SET active = $1 WHERE id = $2 RETURNING *",
      [active, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User status updated successfully", userId, active });
  } catch (error) {
    console.error("Admin update user status error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) client.release();
  }
});

// Get user status endpoint
app.get("/api/admin/users/:userId/status", async (req, res) => {
  let client: PoolClient | null = null;
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    // Verify the token (we don't need to store the decoded result for this endpoint)
    jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here");

    const { userId } = req.params;
    client = await pool.connect();
    const result = await client.query(
      "SELECT id, email, active FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      active: result.rows[0].active,
      userId: result.rows[0].id,
      email: result.rows[0].email,
    });
  } catch (error) {
    console.error("Get user status error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) client.release();
  }
});

// Blocked user support message endpoint
app.post("/api/support/message", async (req: Request, res: Response) => {
  let client: PoolClient | null = null;
  try {
    const { email, subject, message } = req.body;

    // Validate input
    if (!email || !subject || !message) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["email", "subject", "message"],
      });
    }

    client = await pool.connect();

    // Store the support message in the database
    // You might want to create a support_messages table
    // For now, we'll just return success
    // TODO: Create support_messages table and store messages

    console.log("Support message received:", { email, subject, message });

    res.status(201).json({
      message: "Support message sent successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Support message error:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// User sends a notification message
app.post("/api/notifications", async (req: Request, res: Response) => {
  const { user_id, message } = req.body;
  if (!user_id || !message) {
    return res
      .status(400)
      .json({ message: "user_id and message are required" });
  }
  try {
    const notification = await createNotification(user_id, message);
    res.status(201).json(notification);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to send notification", error: error.message });
  }
});

// Admin fetches all notifications
app.get("/api/notifications", async (_req: Request, res: Response) => {
  try {
    const notifications = await getAllNotifications();
    res.json(notifications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch notifications", error: error.message });
  }
});

// Admin replies to a notification
app.post(
  "/api/notifications/:id/reply",
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reply } = req.body;
    if (!reply) {
      return res.status(400).json({ message: "Reply is required" });
    }
    try {
      const notification = await replyToNotification(Number(id), reply);
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to reply to notification",
        error: error.message,
      });
    }
  }
);

// User fetches their notifications (including admin replies)
app.get(
  "/api/notifications/user/:user_id",
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
      const notifications = await getUserNotifications(Number(user_id));
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch user notifications",
        error: error.message,
      });
    }
  }
);

// Mark notification as read
app.put("/api/notifications/:id/read", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
});

// User limits endpoints
import {
  getUserLimit,
  createOrUpdateUserLimit,
  deleteUserLimit,
} from "./models/userLimit.js";
import { checkLimits } from "./services/limitAlerts.js";

// Get user limits
app.get("/api/user-limits/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const userLimit = await getUserLimit(Number(user_id));
    res.json(userLimit);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch user limits",
      error: error.message,
    });
  }
});

// Create or update user limits
app.post("/api/user-limits/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const limitData = req.body;
    const userLimit = await createOrUpdateUserLimit(Number(user_id), limitData);
    res.json(userLimit);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create/update user limits",
      error: error.message,
    });
  }
});

// Delete user limits
app.delete("/api/user-limits/:user_id", async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    await deleteUserLimit(Number(user_id));
    res.json({ message: "User limits deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete user limits",
      error: error.message,
    });
  }
});

// Serve index.html for all other routes
app.get("*", (_req: Request, res: Response) => {
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

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
};

// Log environment and db config before starting the server
console.log("ENV:", process.env);
console.log("DB CONFIG:", dbConfig);

// Log database configuration (excluding sensitive data)
console.log("Database configuration:", {
  ...dbConfig,
  password: "****",
  connectionString: dbConfig.connectionString ? "****" : undefined,
});
