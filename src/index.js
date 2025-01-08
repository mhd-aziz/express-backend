// src/index.js
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerSetup = require("./swagger"); // Ensure you have this file
const authRoutes = require("./routes/authRoutes");
const prisma = require("./prisma");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiter to all auth routes
app.use("/", authLimiter, authRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Auth API is running with Prisma");
});

// Initialize Swagger
swaggerSetup(app);

// Error Handling Middleware (should be after all other middleware and routes)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Manage Prisma Connection
prisma
  .$connect()
  .then(() => {
    console.log("Connected to Prisma");
  })
  .catch((e) => {
    console.error("Prisma connection error:", e);
    process.exit(1);
  });

// Handle shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
