import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables FIRST, before any other imports
console.log("🔧 Loading environment variables...");
const result = dotenv.config({ path: "./.env" });
if (result.error) {
  console.error("❌ Error loading .env file:", result.error);
} else {
  console.log("✅ .env file loaded successfully");
}

// Now import everything else after environment variables are loaded
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import session from "express-session";
import passport from "passport";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Import passport config dynamically after environment variables are loaded
import("./config/passport.js");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined"));

// Rate limiting - reasonable for dev and prod
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 300, // 100 in prod, 300 in dev
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health",
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL, "https://squirell.onrender.com"] 
      : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Explicit OPTIONS handler for CORS preflight on /uploads/*
app.options("/uploads/*", (req, res) => {
  const origin = process.env.NODE_ENV === "production" 
    ? (process.env.FRONTEND_URL || "https://squirell.onrender.com")
    : "http://localhost:5173";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.sendStatus(200);
});

// Allow CORS for static files
app.use("/uploads", (req, res, next) => {
  const origin = process.env.NODE_ENV === "production" 
    ? (process.env.FRONTEND_URL || "https://squirell.onrender.com")
    : "http://localhost:5173";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Squirell Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, "../dist")));

// Catch-all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === "production"
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI || "mongodb://localhost:27017/squirell",
      {
        maxPoolSize: 10, // Limit connection pool for free tier
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Monitor connection events
    mongoose.connection.on("error", (err) => {
      console.error("🚨 MongoDB Connection Error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB Reconnected");
    });
  } catch (error) {
    console.error("Database connection error:", error);
    console.error("This might be due to MongoDB Atlas free tier limitations");
    console.error(
      "Consider upgrading or using a local MongoDB instance for development"
    );
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🌐 Server bound to 0.0.0.0:${PORT}`);
  });
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("🚨 UNHANDLED PROMISE REJECTION:");
  console.error("Error:", err);
  console.error("Promise:", promise);
  console.error("Stack:", err.stack);
  console.error("Timestamp:", new Date().toISOString());
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:");
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  console.error("Timestamp:", new Date().toISOString());
  process.exit(1);
});

// Monitor memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log("📊 Memory Usage:", {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    timestamp: new Date().toISOString(),
  });
}, 300000); // Log every 5 minutes

startServer();

export default app;
