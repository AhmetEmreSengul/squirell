import express from "express";
import { body, validationResult } from "express-validator";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { protect, checkOwnership, rateLimit } from "../middleware/auth.js";
import {
  uploadAvatar,
  handleUploadError,
  getFileUrl,
  deleteFromCloudinary,
} from "../middleware/upload.js";

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate(
        "bookmarkedProducts",
        "title primaryImage sharePrice totalValue"
      )
      .populate("likedProducts", "title primaryImage sharePrice totalValue");

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    protect,
    uploadAvatar,
    handleUploadError,
    body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
    body("phone").optional().trim(),
    body("dateOfBirth").optional().isISO8601(),
    body("gender")
      .optional()
      .isIn(["male", "female", "other", "prefer-not-to-say"]),
    body("investmentProfile").optional().isObject(),
    body("preferences").optional().isObject(),
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

      const user = await User.findById(req.user._id);

      // Update basic info
      const updateFields = [
        "firstName",
        "lastName",
        "phone",
        "dateOfBirth",
        "gender",
      ];
      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      // Update investment profile
      if (req.body.investmentProfile) {
        const profile = JSON.parse(req.body.investmentProfile);
        user.investmentProfile = { ...user.investmentProfile, ...profile };
      }

      // Update preferences
      if (req.body.preferences) {
        const preferences = JSON.parse(req.body.preferences);
        user.preferences = { ...user.preferences, ...preferences };
      }

      // Handle avatar upload
      if (req.file) {
        // Delete old avatar if exists
        if (user.avatar && user.avatar.includes("cloudinary")) {
          const publicId = user.avatar.split("/").pop().split(".")[0];
          await deleteFromCloudinary(publicId);
        }
        user.avatar = req.file.path;
      }

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }
);

// @route   GET /api/users/products
// @desc    Get user's products
// @access  Private
router.get(
  "/products",
  [
    protect,
    body("page").optional().isInt({ min: 1 }),
    body("limit").optional().isInt({ min: 1, max: 50 }),
    body("status")
      .optional()
      .isIn(["draft", "pending", "active", "funded", "closed", "suspended"]),
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

      const { page = 1, limit = 20, status } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = { owner: req.user._id };
      if (status) query.status = status;

      const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user products",
      });
    }
  }
);

// @route   GET /api/users/bookmarks
// @desc    Get user's bookmarked products
// @access  Private
router.get(
  "/bookmarks",
  [
    protect,
    body("page").optional().isInt({ min: 1 }),
    body("limit").optional().isInt({ min: 1, max: 50 }),
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

      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user._id).populate({
        path: "bookmarkedProducts",
        options: {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 },
        },
      });

      const total = user.bookmarkedProducts.length;

      // Add isBookmarked field to each product
      const products = user.bookmarkedProducts.map((product) => {
        const productObj = product.toObject();
        productObj.isBookmarked = true; // These are all bookmarked products
        return productObj;
      });

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch bookmarks",
      });
    }
  }
);

// @route   GET /api/users/reviews
// @desc    Get user's reviews
// @access  Private
router.get(
  "/reviews",
  [
    protect,
    body("page").optional().isInt({ min: 1 }),
    body("limit").optional().isInt({ min: 1, max: 50 }),
    body("status").optional().isIn(["pending", "approved", "rejected"]),
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

      const { page = 1, limit = 20, status } = req.query;

      const skip = (page - 1) * limit;

      const reviews = await Review.findByAuthor(req.user._id, {
        status,
        sortBy: "createdAt",
        sortOrder: "desc",
        limit: parseInt(limit),
        skip,
      });

      const total = await Review.countDocuments({ author: req.user._id });

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get user reviews error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user reviews",
      });
    }
  }
);

// @route   GET /api/users/investments
// @desc    Get user's investment portfolio
// @access  Private
router.get("/investments", protect, async (req, res) => {
  try {
    // This would typically connect to an investment/transaction system
    // For now, we'll return basic portfolio info
    const user = await User.findById(req.user._id);

    const portfolio = {
      totalInvested: user.totalInvested,
      totalEarnings: user.totalEarnings,
      portfolioValue: user.portfolioValue,
      // Add more investment details as needed
    };

    res.json({
      success: true,
      data: { portfolio },
    });
  } catch (error) {
    console.error("Get investments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments",
    });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put(
  "/password",
  [
    protect,
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

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete(
  "/account",
  [
    protect,
    body("password")
      .notEmpty()
      .withMessage("Password is required for account deletion"),
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

      const { password } = req.body;
      const user = await User.findById(req.user._id).select("+password");

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Password is incorrect",
        });
      }

      // Delete user's products
      await Product.deleteMany({ owner: req.user._id });

      // Delete user's reviews
      await Review.deleteMany({ author: req.user._id });

      // Delete user account
      await User.findByIdAndDelete(req.user._id);

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete account",
      });
    }
  }
);

// @route   POST /api/users/kyc
// @desc    Submit KYC documents
// @access  Private
router.post(
  "/kyc",
  [
    protect,
    uploadAvatar,
    handleUploadError,
    body("documentType")
      .isIn(["passport", "drivers-license", "national-id"])
      .withMessage("Invalid document type"),
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

      const { documentType } = req.body;
      const user = await User.findById(req.user._id);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one document is required",
        });
      }

      // Process uploaded documents
      const documents = req.files.map((file) => ({
        type: documentType,
        url: file.path,
        uploadedAt: new Date(),
      }));

      user.kycDocuments.push(...documents);
      user.kycStatus = "pending";
      await user.save();

      res.json({
        success: true,
        message: "KYC documents submitted successfully",
        data: { kycStatus: user.kycStatus },
      });
    } catch (error) {
      console.error("Submit KYC error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit KYC documents",
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get public user profile
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("firstName lastName avatar investmentProfile createdAt")
      .populate(
        "bookmarkedProducts",
        "title primaryImage sharePrice totalValue"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get public user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

export default router;
