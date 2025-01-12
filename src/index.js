// src/index.js
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes"); // Tambahkan ini
const prisma = require("./prisma");
const errorHandler = require("./middleware/errorHandler");
const morgan = require("morgan");
const logger = require("./utils/logger");
const enforce = require("express-sslify");

const app = express();

// Logging dengan morgan dan winston
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Konfigurasi CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware untuk parsing JSON
app.use(express.json({ limit: "10kb", type: ["application/json"] }));

// Konfigurasi Helmet untuk keamanan
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
app.use(helmet.frameguard({ action: "deny" }));
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: "none",
  })
);

// Enforce HTTPS di lingkungan produksi
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Rate Limiting Global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Maksimum 1000 request per IP per windowMs
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate Limiting khusus Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Maksimum 100 request per IP per windowMs untuk auth routes
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/auth", authLimiter, authRoutes);

// Gunakan Router Pegawai
app.use("/employees", employeeRoutes);

// Route dasar
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Middleware Error Handling
app.use(errorHandler);

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running at ${process.env.SERVER_URL || "http://localhost"}:${PORT}`
  );
});

// Koneksi Prisma
prisma
  .$connect()
  .then(() => {
    logger.info("Connected to Prisma");
  })
  .catch((e) => {
    logger.error("Prisma connection error:", e);
    process.exit(1);
  });

// Shutdown Handler
const shutdown = async () => {
  await prisma.$disconnect();
  logger.info("Prisma disconnected. Shutting down.");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
