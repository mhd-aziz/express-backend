const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const prisma = require("./prisma");
const errorHandler = require("./middleware/errorHandler");
const morgan = require("morgan");
const logger = require("./utils/logger");
const enforce = require("express-sslify");
const app = express();

app.set('trust proxy', 1);

const getClientIp = (req) => {
  const ip = req.ip;
  
  if (ip === '::1') return '127.0.0.1';
  
  const parts = ip.split(':');
  
  if (parts.length > 1 && parts[parts.length - 1].length <= 5) {
    parts.pop();
    return parts.join(':');
  }
  
  return ip;
};

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb", type: ["application/json"] }));

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

if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  },
});
app.use("/auth", authLimiter, authRoutes);

app.use("/employees", employeeRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running at ${process.env.SERVER_URL || "http://localhost"}:${PORT}`
  );
});

prisma
  .$connect()
  .then(() => {
    logger.info("Connected to Prisma");
  })
  .catch((e) => {
    logger.error("Prisma connection error:", e);
    process.exit(1);
  });

const shutdown = async () => {
  await prisma.$disconnect();
  logger.info("Prisma disconnected. Shutting down.");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
