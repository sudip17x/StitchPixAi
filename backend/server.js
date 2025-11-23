// backend/server.js
import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kitabghar",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test endpoint
app.get("/", (req, res) => {
  res.send("✅ KitabGhar Backend is Running");
});

// ----------------------------
// 📘 User Registration
// ----------------------------
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'reader')",
      [name, email, password]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// 🔐 User Login
// ----------------------------
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) return res.status(404).json({ message: "User not found" });

    const user = users[0];
    if (user.password_hash !== password)
      return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// 🚀 Start Server
// ----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
