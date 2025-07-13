// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging
  console.error("🚨 ERROR OCCURRED:");
  console.error("Timestamp:", new Date().toISOString());
  console.error("Method:", req.method);
  console.error("URL:", req.url);
  console.error("User Agent:", req.get("User-Agent"));
  console.error("IP:", req.ip);
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  console.error("Request Body:", req.body);
  console.error("Request Headers:", req.headers);
  console.error("---");

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field";
    error = { message, statusCode: 400 };
  }

  // Cloudinary errors
  if (err.http_code) {
    const message = err.message || "File upload failed";
    error = { message, statusCode: err.http_code };
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
