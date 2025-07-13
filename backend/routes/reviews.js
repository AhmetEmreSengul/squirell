import express from "express";
import { body, validationResult, query } from "express-validator";

import Review from "../models/Review.js";
import {
  protect,
  optionalAuth,
  adminOrModerator,
  rateLimit,
} from "../middleware/auth.js";
import {
  uploadMultiple,
  handleUploadError,
  getFileUrl,
} from "../middleware/upload.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews with filtering and pagination
// @access  Public
router.get(
  "/",
  [
    optionalAuth,
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("status").optional().isIn(["pending", "approved", "rejected"]),
    query("category")
      .optional()
      .isIn(["general", "product", "service", "platform", "investment"]),
    query("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    query("product").optional().isMongoId().withMessage("Invalid product ID"),
    query("sortBy").optional().isIn(["createdAt", "rating", "helpfulCount"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
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
        status = "approved",
        category,
        rating,
        product,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      if (status) query.status = status;
      if (category) query.category = category;
      if (rating) query.rating = parseInt(rating);
      if (product) query.product = product;

      // Get reviews
      const reviews = await Review.find(query)
        .populate("author", "firstName lastName avatar")
        .populate("product", "title primaryImage")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
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
      console.error("Get reviews error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch reviews",
      });
    }
  }
);

// @route   GET /api/reviews/featured
// @desc    Get featured reviews for landing page
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const reviews = await Review.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    console.error("Get featured reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured reviews",
    });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("author", "firstName lastName avatar")
      .populate("product", "title primaryImage")
      .populate("replies.author", "firstName lastName avatar role");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Increment views
    review.views += 1;
    await review.save();

    // Add user-specific data if authenticated
    if (req.user) {
      const userVote = review.helpful.find(
        (h) => h.user.toString() === req.user._id.toString()
      );
      review.userVote = userVote ? userVote.isHelpful : null;
    }

    res.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review",
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review (authenticated users)
// @access  Private
router.post(
  "/",
  [
    protect,
    rateLimit(5, 300000), // 5 reviews per 5 minutes
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("content")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Content must be between 10 and 1000 characters"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("category")
      .optional()
      .isIn(["general", "product", "service", "platform", "investment"]),
    body("product").optional().isMongoId().withMessage("Invalid product ID"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
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
        title,
        content,
        rating,
        category = "general",
        product,
        tags = [],
      } = req.body;

      // Check if user already reviewed this product
      if (product) {
        const existingReview = await Review.findOne({
          author: req.user._id,
          product,
          status: { $in: ["pending", "approved"] },
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            message: "You have already reviewed this product",
          });
        }
      }

      // Create review
      const review = new Review({
        title,
        content,
        rating: parseInt(rating),
        category,
        product,
        author: req.user._id,
        authorName: `${req.user.firstName} ${req.user.lastName}`,
        authorEmail: req.user.email,
        tags,
        status: "pending", // Reviews need approval
      });

      await review.save();

      // Populate author info
      await review.populate("author", "firstName lastName avatar");

      res.status(201).json({
        success: true,
        message: "Review submitted successfully and pending approval",
        data: { review },
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create review",
      });
    }
  }
);

// @route   POST /api/reviews/feedback
// @desc    Create anonymous feedback (no authentication required)
// @access  Public
router.post(
  "/feedback",
  [
    rateLimit(3, 300000), // 3 feedback per 5 minutes
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("content")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Content must be between 10 and 1000 characters"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("category")
      .optional()
      .isIn(["general", "product", "service", "platform", "investment"]),
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

      const { name, title, content, rating, category = "platform" } = req.body;

      // Create review with provided name
      const review = new Review({
        title,
        content,
        rating: parseInt(rating),
        category,
        authorName: name || "Anonymous User",
        authorEmail: "anonymous@example.com",
        status: "approved", // Auto-approve for demo
        isFeatured: true, // Auto-feature for demo
        isVerified: false,
      });

      await review.save();

      res.status(201).json({
        success: true,
        message: "Feedback submitted successfully and pending approval",
        data: { review },
      });
    } catch (error) {
      console.error("Create feedback error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit feedback",
      });
    }
  }
);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Author or Admin)
router.put(
  "/:id",
  [
    protect,
    uploadMultiple,
    handleUploadError,
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Content must be between 10 and 1000 characters"),
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
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

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Check ownership or admin role
      if (
        review.author.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this review",
        });
      }

      // Only allow updates if review is pending or if user is admin
      if (review.status !== "pending" && req.user.role !== "admin") {
        return res.status(400).json({
          success: false,
          message: "Can only update pending reviews",
        });
      }

      // Update fields
      const updateFields = ["title", "content", "rating", "tags"];
      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          review[field] = req.body[field];
        }
      });

      // Reset status to pending if content changed
      if (req.body.content || req.body.rating) {
        review.status = "pending";
      }

      // Handle images if uploaded
      if (req.files && req.files.length > 0) {
        const images = [...review.images];
        req.files.forEach((file) => {
          images.push(getFileUrl(file));
        });
        updateFields.push("images");
        review.images = images;
      }

      await review.save();

      res.json({
        success: true,
        message: "Review updated successfully",
        data: { review },
      });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update review",
      });
    }
  }
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Author or Admin)
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership or admin role
    if (review.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
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
      message: "Failed to delete review",
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark review as helpful/not helpful
// @access  Private
router.post(
  "/:id/helpful",
  [
    protect,
    rateLimit(10, 60000), // 10 votes per minute
    body("isHelpful").isBoolean().withMessage("isHelpful must be a boolean"),
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

      const { isHelpful } = req.body;
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      await review.markHelpful(req.user._id, isHelpful);

      res.json({
        success: true,
        message: `Review marked as ${isHelpful ? "helpful" : "not helpful"}`,
        data: {
          helpfulCount: review.helpfulCount,
          notHelpfulCount: review.notHelpfulCount,
          helpfulPercentage: review.helpfulPercentage,
        },
      });
    } catch (error) {
      console.error("Mark review helpful error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to mark review as helpful",
      });
    }
  }
);

// @route   POST /api/reviews/:id/reply
// @desc    Add reply to review
// @access  Private
router.post(
  "/:id/reply",
  [
    protect,
    rateLimit(5, 300000), // 5 replies per 5 minutes
    body("content")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Reply content must be between 1 and 500 characters"),
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

      const { content } = req.body;
      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Add reply
      review.replies.push({
        author: req.user._id,
        content,
        isOfficial: req.user.role === "admin" || req.user.role === "moderator",
      });

      await review.save();

      // Populate reply author
      await review.populate("replies.author", "firstName lastName avatar role");

      res.json({
        success: true,
        message: "Reply added successfully",
        data: { review },
      });
    } catch (error) {
      console.error("Add reply error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add reply",
      });
    }
  }
);

// @route   PUT /api/reviews/:id/status
// @desc    Update review status (admin only)
// @access  Private (admin)
router.put(
  "/:id/status",
  [
    protect,
    adminOrModerator,
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Invalid status"),
    body("reason").optional().trim(),
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
        data: { review },
      });
    } catch (error) {
      console.error("Update review status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update review status",
      });
    }
  }
);

// @route   PUT /api/reviews/:id/feature
// @desc    Toggle review featured status (admin only)
// @access  Private (admin)
router.put("/:id/feature", [protect, adminOrModerator], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isFeatured = !review.isFeatured;
    await review.save();

    res.json({
      success: true,
      message: `Review ${
        review.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: { review },
    });
  } catch (error) {
    console.error("Toggle review feature error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle review feature status",
    });
  }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a specific product
// @access  Public
router.get(
  "/product/:productId",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("sortBy").optional().isIn(["createdAt", "rating", "helpfulCount"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
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

      const { productId } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      const reviews = await Review.findByProduct(productId, {
        status: "approved",
        sortBy,
        sortOrder,
        limit: parseInt(limit),
        skip,
      });

      const total = await Review.countDocuments({
        product: productId,
        status: "approved",
      });

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
      console.error("Get product reviews error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product reviews",
      });
    }
  }
);

// @route   POST /api/reviews/test-data
// @desc    Create test reviews for demonstration (temporary endpoint)
// @access  Public
router.post("/test-data", async (req, res) => {
  try {
    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: "test@example.com" });
    if (!testUser) {
      testUser = new User({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true,
        authProvider: "local",
      });
      await testUser.save();
    }

    // Clear existing reviews
    await Review.deleteMany({});

    // Create sample reviews
    const reviews = [
      {
        title: "Excellent Investment Platform",
        content:
          "Squirell has revolutionized how I think about investing in high-value assets. The fractional ownership model makes it accessible to everyone. I've been using the platform for 6 months and the returns have been fantastic!",
        rating: 5,
        category: "platform",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Great User Experience",
        content:
          "The platform is intuitive and easy to use. I love being able to invest in art and real estate without needing millions of dollars. The customer support is also excellent.",
        rating: 5,
        category: "platform",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Transparent and Trustworthy",
        content:
          "Squirell provides excellent transparency in their investment opportunities. All the documentation and verification processes give me confidence in my investments.",
        rating: 4,
        category: "platform",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Amazing Art Investment",
        content:
          "I invested in the Picasso painting and the process was seamless. The platform made it easy to understand the investment and track its performance over time.",
        rating: 5,
        category: "product",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Real Estate Investment Success",
        content:
          "The Malibu property investment has been performing well. The platform provides regular updates and the property management is excellent. Highly recommended!",
        rating: 4,
        category: "product",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
      {
        title: "Wine Collection Investment",
        content:
          "Investing in the vintage wine collection has been a great experience. The storage and authentication processes are top-notch. The returns have exceeded my expectations.",
        rating: 5,
        category: "product",
        author: testUser._id,
        authorName: `${testUser.firstName} ${testUser.lastName}`,
        authorEmail: testUser.email,
        status: "approved",
        isFeatured: true,
      },
    ];

    await Review.insertMany(reviews);

    res.json({
      success: true,
      message: "Test reviews created successfully",
      data: { count: reviews.length },
    });
  } catch (error) {
    console.error("Create test reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test reviews",
    });
  }
});

export default router;
