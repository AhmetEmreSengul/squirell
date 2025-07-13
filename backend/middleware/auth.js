import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      if (req.user.isBanned) {
        return res.status(401).json({
          success: false,
          message: "Account is banned",
          banReason: req.user.banReason,
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Optional authentication - user can be authenticated but not required
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Token is invalid, but we don't fail the request
      req.user = null;
    }
  }

  next();
};

// Require email verification
export const requireEmailVerification = async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required",
    });
  }
  next();
};

// Require KYC verification
export const requireKYC = async (req, res, next) => {
  if (req.user.kycStatus !== "verified") {
    return res.status(403).json({
      success: false,
      message: "KYC verification required",
      kycStatus: req.user.kycStatus,
    });
  }
  next();
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

// Admin only
export const adminOnly = authorize("admin");

// Admin or moderator
export const adminOrModerator = authorize("admin", "moderator");

// Check if user owns the resource
export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const Model = mongoose.model(modelName);

      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
        });
      }

      // Check if user owns the resource or is admin
      if (
        resource.owner.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking resource ownership",
      });
    }
  };
};

// Rate limiting for specific actions
export const rateLimit = (maxRequests, windowMs) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(key)) {
      requests.set(
        key,
        requests.get(key).filter((timestamp) => timestamp > windowStart)
      );
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }

    userRequests.push(now);
    next();
  };
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export default {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  rateLimit,
  generateToken,
  requireEmailVerification,
  requireKYC,
  adminOnly,
  adminOrModerator,
};
