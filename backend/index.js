import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Connect MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Start Server
app.listen(5000, () =>
  console.log("Backend Server Running on http://localhost:5000")
);
