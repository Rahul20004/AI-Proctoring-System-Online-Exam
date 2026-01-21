import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { exec } from "child_process";
import { writeFileSync } from "fs";
import path from "path";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import examRoutes from "./routes/examRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import codingRoutes from "./routes/codingRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

// =======================
// ENV & DATABASE
// =======================
dotenv.config(); // IMPORTANT
connectDB();

// =======================
// APP
// =======================
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://ai-proctored-system.vercel.app",
    ],
    credentials: true,
  })
);

// =======================
// CODE EXECUTION APIs
// =======================

// Python
app.post("/run-python", (req, res) => {
  const { code } = req.body;
  writeFileSync("script.py", code);

  exec("python script.py", (error, stdout, stderr) => {
    if (error) return res.status(400).send(stderr);
    res.send(stdout);
  });
});

// JavaScript
app.post("/run-javascript", (req, res) => {
  const { code } = req.body;
  writeFileSync("script.js", code);

  exec("node script.js", (error, stdout, stderr) => {
    if (error) return res.status(400).send(stderr);
    res.send(stdout);
  });
});

// Java
app.post("/run-java", (req, res) => {
  const { code } = req.body;
  writeFileSync("Main.java", code);

  exec("javac Main.java && java Main", (error, stdout, stderr) => {
    if (error) return res.status(400).send(stderr);
    res.send(stdout);
  });
});

// =======================
// ROUTES
// =======================
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/coding", codingRoutes);

// =======================
// PRODUCTION (for Vercel / Render)
// =======================
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// =======================
// ERROR HANDLERS
// =======================
app.use(notFound);
app.use(errorHandler);

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
