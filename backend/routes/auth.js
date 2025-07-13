import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";
import {
  protect,
  generateToken,
  requireEmailVerification,
} from "../middleware/auth.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
} from "../utils/email.js";

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    authLimiter,
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      console.log("Registration request body:", req.body);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      });

      // For now, skip email verification to avoid email service issues
      // TODO: Implement email verification later
      user.isEmailVerified = true;
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully!",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    authLimiter,
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      console.log("Login request body:", req.body);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Login validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is banned
      if (user.isBanned) {
        return res.status(401).json({
          success: false,
          message: "Account is banned",
          banReason: user.banReason,
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      // Check password
      console.log("Checking password for user:", user.email);
      const isMatch = await user.comparePassword(password);
      console.log("Password match result:", isMatch);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data",
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", protect, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// @route   POST /api/auth/verify-email
// @desc    Verify email
// @access  Public
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post("/resend-verification", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Squirell",
      template: "emailVerification",
      data: {
        name: user.firstName,
        verificationUrl,
      },
    });

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post(
  "/forgot-password",
  [
    authLimiter,
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password?token=${resetToken}`;

      try {
        await sendEmail({
          email: user.email,
          subject: "Reset Your Password - Squirell",
          template: "passwordReset",
          data: {
            name: user.firstName,
            resetUrl,
          },
        });

        res.json({
          success: true,
          message: "Password reset email sent successfully",
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);

        // In development, return the reset URL directly
        if (process.env.NODE_ENV === "development") {
          res.json({
            success: true,
            message: "Password reset link generated successfully",
            resetUrl: resetUrl,
            note: "Email service not configured. Use the reset URL above for testing.",
          });
        } else {
          res.status(500).json({
            success: false,
            message:
              "Failed to send password reset email. Please try again later.",
          });
        }
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Set new password
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Password reset failed",
      });
    }
  }
);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match new password");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select("+password");

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Set new password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }
);

// Google OAuth routes
// @route   GET /api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  }
);

// Apple OAuth routes
// @route   GET /api/auth/apple
// @desc    Apple OAuth login
// @access  Public
router.get("/apple", passport.authenticate("apple"));

// @route   POST /api/auth/apple/callback
// @desc    Apple OAuth callback
// @access  Public
router.post(
  "/apple/callback",
  passport.authenticate("apple", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect to frontend with token
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  }
);

export default router;
