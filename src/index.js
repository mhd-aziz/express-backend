// src/index.js
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const swaggerSetup = require("./swagger"); // Pastikan file ini ada dan benar
const authRoutes = require("./routes/authRoutes");
const prisma = require("./prisma");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Middleware Keamanan
app.use(helmet());

// Konfigurasi CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Rate Limiting untuk Rute Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // batas tiap IP 100 permintaan per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Terapkan rate limiter ke semua rute auth
app.use("/", authLimiter, authRoutes); // Pastikan rute auth Anda berada di bawah /api/auth

// Endpoint Root
app.get("/", (req, res) => {
  res.send("Auth API is running with Prisma");
});

// Inisialisasi Swagger
swaggerSetup(app);

// Middleware Penanganan Error (harus setelah semua middleware dan rute lainnya)
app.use(errorHandler);

// Penanganan Shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Koneksi ke Prisma dan Mulai Server
prisma
  .$connect()
  .then(() => {
    console.log("Connected to Prisma");

    // Mulai Server setelah koneksi database berhasil
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      // Binding ke semua alamat IP
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Prisma connection error:", e);
    process.exit(1);
  });
