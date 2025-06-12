import dotenv from "dotenv";

dotenv.config();

export const SERVER_CONFIG = {
  PORT: 3000,
  API_URL: "http://localhost:3000/api",
  CORS_ORIGIN: "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
