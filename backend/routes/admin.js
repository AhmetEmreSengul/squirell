import express from "express";
import { body, validationResult, query } from "express-validator";

import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require admin role
router.use(protect, authorize("admin"));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get("/dashboard", async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          bannedUsers: {
            $sum: { $cond: [{ $eq: ["$isBanned", true] }, 1, 0] },
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] },
          },
          kycVerifiedUsers: {
            $sum: { $cond: [{ $eq: ["$kycStatus", "verified"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          fundedProducts: {
            $sum: { $cond: [{ $eq: ["$status", "funded"] }, 1, 0] },
          },
          pendingProducts: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          totalValue: { $sum: "$totalValue" },
          totalInvested: {
            $sum: {
              $multiply: [
                "$sharePrice",
                { $subtract: ["$totalShares", "$availableShares"] },
              ],
            },
          },
        },
      },
    ]);

    // Get review statistics
    const reviewStats = await Review.getStats();

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt");

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status totalValue createdAt")
      .populate("owner", "firstName lastName");

    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title rating status createdAt")
      .populate("author", "firstName lastName");

    res.json({
      success: true,
      data: {
        userStats: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          verifiedUsers: 0,
          kycVerifiedUsers: 0,
        },
        productStats: productStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          fundedProducts: 0,
          pendingProducts: 0,
          totalValue: 0,
          totalInvested: 0,
        },
        reviewStats,
        recentActivity: {
          users: recentUsers,
          products: recentProducts,
          reviews: recentReviews,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin)
router.get(
  "/users",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("role")
      .optional()
      .isIn(["user", "admin", "moderator"])
      .withMessage("Invalid role"),
    query("status")
      .optional()
      .isIn(["active", "banned", "inactive"])
      .withMessage("Invalid status"),
    query("kycStatus")
      .optional()
      .isIn(["pending", "verified", "rejected"])
      .withMessage("Invalid KYC status"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "firstName", "email", "lastLogin"])
      .withMessage("Invalid sort option"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
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

      const {
        page = 1,
        limit = 20,
        search,
        role,
        status,
        kycStatus,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (search) {
        query.$or = [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ];
      }
      if (role) query.role = role;
      if (status === "banned") query.isBanned = true;
      if (status === "inactive") query.isActive = false;
      if (kycStatus) query.kycStatus = kycStatus;

      const users = await User.find(query)
        .select("-password")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban/unban a user
// @access  Private (Admin)
router.put(
  "/users/:id/ban",
  [
    body("isBanned").isBoolean().withMessage("isBanned must be a boolean"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { isBanned, reason } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from banning themselves
      if (user._id.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot ban yourself",
        });
      }

      user.isBanned = isBanned;
      if (reason) {
        user.banReason = reason;
      } else if (!isBanned) {
        user.banReason = undefined;
      }

      await user.save();

      res.json({
        success: true,
        message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBanned: user.isBanned,
          banReason: user.banReason,
        },
      });
    } catch (error) {
      console.error("Ban user error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id/role
// @desc    Change user role
// @access  Private (Admin)
router.put(
  "/users/:id/role",
  [
    body("role")
      .isIn(["user", "admin", "moderator"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { role } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from changing their own role
      if (user._id.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "Cannot change your own role",
        });
      }

      user.role = role;
      await user.save();

      res.json({
        success: true,
        message: `User role changed to ${role}`,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Change user role error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/users/:id/kyc
// @desc    Update user KYC status
// @access  Private (Admin)
router.put(
  "/users/:id/kyc",
  [
    body("kycStatus")
      .isIn(["pending", "verified", "rejected"])
      .withMessage("Invalid KYC status"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { kycStatus, notes } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.kycStatus = kycStatus;

      // Update verification date for verified documents
      if (kycStatus === "verified") {
        user.kycDocuments.forEach((doc) => {
          if (!doc.verifiedAt) {
            doc.verifiedAt = new Date();
          }
        });
      }

      await user.save();

      res.json({
        success: true,
        message: "KYC status updated successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          kycStatus: user.kycStatus,
          notes: user.kycNotes,
        },
      });
    } catch (error) {
      console.error("Update KYC status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/admin/products
// @desc    Get all products with admin filtering
// @access  Private (Admin)
router.get(
  "/products",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("status")
      .optional()
      .isIn(["draft", "pending", "active", "funded", "closed", "suspended"])
      .withMessage("Invalid status"),
    query("category")
      .optional()
      .isIn(["art", "land", "real-estate", "collectibles", "other"])
      .withMessage("Invalid category"),
    query("owner").optional().isMongoId().withMessage("Invalid owner ID"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "title", "totalValue", "status"])
      .withMessage("Invalid sort option"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        search,
        status,
        category,
        owner,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (search) {
        query.$text = { $search: search };
      }
      if (status) query.status = status;
      if (category) query.category = category;
      if (owner) query.owner = owner;

      const products = await Product.find(query)
        .populate("owner", "firstName lastName email")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
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
      console.error("Get admin products error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/products/:id/status
// @desc    Change product status
// @access  Private (Admin)
router.put(
  "/products/:id/status",
  [
    body("status")
      .isIn(["draft", "pending", "active", "funded", "closed", "suspended"])
      .withMessage("Invalid status"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { status, reason } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.status = status;
      if (reason) {
        product.moderationNotes = reason;
      }

      await product.save();

      res.json({
        success: true,
        message: `Product status changed to ${status}`,
        data: {
          id: product._id,
          title: product.title,
          status: product.status,
        },
      });
    } catch (error) {
      console.error("Change product status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/products/:id/feature
// @desc    Toggle product featured status
// @access  Private (Admin)
router.put(
  "/products/:id/feature",
  [body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { isFeatured } = req.body;

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.isFeatured = isFeatured;
      await product.save();

      res.json({
        success: true,
        message: `Product ${
          isFeatured ? "featured" : "unfeatured"
        } successfully`,
        data: {
          id: product._id,
          title: product.title,
          isFeatured: product.isFeatured,
        },
      });
    } catch (error) {
      console.error("Toggle product feature error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/admin/reviews
// @desc    Get all reviews with admin filtering
// @access  Private (Admin)
router.get(
  "/reviews",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid status"),
    query("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Invalid rating"),
    query("author").optional().isMongoId().withMessage("Invalid author ID"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "rating", "helpfulCount"])
      .withMessage("Invalid sort option"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        search,
        status,
        rating,
        author,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (search) {
        query.$or = [
          { title: new RegExp(search, "i") },
          { content: new RegExp(search, "i") },
        ];
      }
      if (status) query.status = status;
      if (rating) query.rating = parseInt(rating);
      if (author) query.author = author;

      const reviews = await Review.find(query)
        .populate("author", "firstName lastName email")
        .populate("product", "title primaryImage")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Review.countDocuments(query);

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
      console.error("Get admin reviews error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/reviews/:id/status
// @desc    Update review status
// @access  Private (Admin)
router.put(
  "/reviews/:id/status",
  [
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid status"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { status, reason } = req.body;

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      review.status = status;
      review.moderatedBy = req.user._id;
      review.moderatedAt = new Date();

      if (status === "rejected" && reason) {
        review.rejectionReason = reason;
      }

      await review.save();

      res.json({
        success: true,
        message: "Review status updated successfully",
        data: {
          id: review._id,
          title: review.title,
          status: review.status,
          rejectionReason: review.rejectionReason,
        },
      });
    } catch (error) {
      console.error("Update review status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/reviews/:id/feature
// @desc    Toggle review featured status
// @access  Private (Admin)
router.put(
  "/reviews/:id/feature",
  [body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { isFeatured } = req.body;

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      review.isFeatured = isFeatured;
      await review.save();

      res.json({
        success: true,
        message: `Review ${
          isFeatured ? "featured" : "unfeatured"
        } successfully`,
        data: {
          id: review._id,
          title: review.title,
          isFeatured: review.isFeatured,
        },
      });
    } catch (error) {
      console.error("Toggle review feature error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private (Admin)
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review
// @access  Private (Admin)
router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
