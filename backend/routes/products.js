import express from "express";
import { body, validationResult, query } from "express-validator";

import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  protect,
  optionalAuth,
  checkOwnership,
  adminOrModerator,
  rateLimit,
} from "../middleware/auth.js";
import {
  uploadProductImages,
  handleUploadError,
  getFileUrl,
  uploadSingle,
  uploadMultiple,
  deleteFromCloudinary,
} from "../middleware/upload.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with pagination, filtering, and sorting
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
    query("search").optional().trim(),
    query("category")
      .optional()
      .isIn([
        "residential",
        "commercial",
        "land",
        "industrial",
        "paintings",
        "sculptures",
        "photography",
        "digital-art",
        "wine",
        "watches",
        "jewelry",
        "coins",
        "stamps",
        "gold",
        "silver",
        "platinum",
        "other",
      ]),
    query("assetType")
      .optional()
      .isIn(["real-estate", "art", "collectibles", "commodities", "other"]),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("minValue").optional().isFloat({ min: 0 }),
    query("maxValue").optional().isFloat({ min: 0 }),
    query("location").optional().trim(),
    query("sortBy")
      .optional()
      .isIn([
        "createdAt",
        "title",
        "sharePrice",
        "totalValue",
        "fundingPercentage",
      ]),
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
        search,
        category,
        assetType,
        minPrice,
        maxPrice,
        minValue,
        maxValue,
        location,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      // Build search query
      const searchOptions = {
        search,
        assetType,
        category,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        location,
        sortBy,
        sortOrder,
        limit: parseInt(limit),
        skip,
        userId: req.user?._id, // Pass userId to include user's draft products
      };

      // Get products
      const products = await Product.search(search, searchOptions);

      // Get total count for pagination
      let totalQuery = { status: "active" };

      // If user is authenticated, also include their draft products
      if (req.user) {
        totalQuery = {
          $or: [{ status: "active" }, { status: "draft", owner: req.user._id }],
        };
      }

      if (search) totalQuery.$text = { $search: search };
      if (assetType) totalQuery.assetType = assetType;
      if (category) totalQuery.category = category;
      if (minPrice || maxPrice) {
        totalQuery.sharePrice = {};
        if (minPrice) totalQuery.sharePrice.$gte = parseFloat(minPrice);
        if (maxPrice) totalQuery.sharePrice.$lte = parseFloat(maxPrice);
      }
      if (minValue || maxValue) {
        totalQuery.totalValue = {};
        if (minValue) totalQuery.totalValue.$gte = parseFloat(minValue);
        if (maxValue) totalQuery.totalValue.$lte = parseFloat(maxValue);
      }
      if (location) {
        totalQuery["location.city"] = new RegExp(location, "i");
      }

      const total = await Product.countDocuments(totalQuery);

      // Add user-specific data if authenticated
      if (req.user) {
        products.forEach((product) => {
          product.isLiked = product.likes.includes(req.user._id);
          product.isBookmarked = product.bookmarks.includes(req.user._id);
        });
      }

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });
    }
  }
);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const products = await Product.findFeatured(parseInt(limit));

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    });
  }
});

// @route   GET /api/products/categories/:category
// @desc    Get products by category
// @access  Public
router.get(
  "/categories/:category",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "title", "sharePrice", "totalValue"]),
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

      const { category } = req.params;
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const skip = (page - 1) * limit;

      const products = await Product.findByCategory(
        category,
        parseInt(limit),
        skip
      );
      const total = await Product.countDocuments({
        category,
        status: "active",
      });

      res.json({
        success: true,
        data: {
          products,
          category,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get products by category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products by category",
      });
    }
  }
);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("owner", "firstName lastName avatar")
      .populate("manager", "firstName lastName avatar");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    // Add user-specific data if authenticated
    if (req.user) {
      product.isLiked = product.likes.includes(req.user._id);
      product.isBookmarked = product.bookmarks.includes(req.user._id);
    }

    // Convert to plain object to ensure all fields are included
    const productObj = product.toObject();
    if (req.user) {
      productObj.isLiked = product.isLiked;
      productObj.isBookmarked = product.isBookmarked;
    }

    res.json({
      success: true,
      data: { product: productObj },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post(
  "/",
  [
    protect,
    uploadMultiple,
    handleUploadError,
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("description")
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be between 10 and 2000 characters"),
    body("assetType")
      .isIn(["real-estate", "art", "collectibles", "commodities", "other"])
      .withMessage("Invalid asset type"),
    body("category")
      .isIn([
        "residential",
        "commercial",
        "land",
        "industrial",
        "paintings",
        "sculptures",
        "photography",
        "digital-art",
        "wine",
        "watches",
        "jewelry",
        "coins",
        "stamps",
        "gold",
        "silver",
        "platinum",
        "other",
      ])
      .withMessage("Invalid category"),
    body("totalValue")
      .isFloat({ min: 1000 })
      .withMessage("Total value must be at least $1,000"),
    body("sharePrice")
      .isFloat({ min: 1 })
      .withMessage("Share price must be at least $1"),
    body("totalShares")
      .isInt({ min: 1 })
      .withMessage("Total shares must be at least 1"),
    body("minimumInvestment")
      .isFloat({ min: 1 })
      .withMessage("Minimum investment must be at least $1"),
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
        description,
        shortDescription,
        assetType,
        category,
        subcategory,
        totalValue,
        sharePrice,
        totalShares,
        minimumInvestment,
        maximumInvestment,
        location,
        specifications,
        performance,
        tags,
        investmentPeriod,
      } = req.body;

      // Validate that total shares * share price equals total value (with tolerance for floating point precision)
      const expectedTotalValue =
        parseFloat(totalShares) * parseFloat(sharePrice);
      const actualTotalValue = parseFloat(totalValue);
      if (Math.abs(expectedTotalValue - actualTotalValue) > 0.01) {
        return res.status(400).json({
          success: false,
          message:
            "Total shares multiplied by share price must equal total value",
        });
      }

      // Process uploaded images
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          images.push({
            url: getFileUrl(file),
            alt: `${title} image ${index + 1}`,
            isPrimary: index === 0,
          });
        });
      }

      // Create product
      const product = new Product({
        title,
        description,
        shortDescription,
        assetType,
        category,
        subcategory,
        totalValue: parseFloat(totalValue),
        sharePrice: parseFloat(sharePrice),
        totalShares: parseInt(totalShares),
        availableShares: parseInt(totalShares),
        minimumInvestment: parseFloat(minimumInvestment),
        maximumInvestment: maximumInvestment
          ? parseFloat(maximumInvestment)
          : undefined,
        location: location ? JSON.parse(location) : undefined,
        specifications: specifications ? JSON.parse(specifications) : undefined,
        performance: performance ? JSON.parse(performance) : undefined,
        images,
        tags: tags ? JSON.parse(tags) : [],
        investmentPeriod: investmentPeriod
          ? JSON.parse(investmentPeriod)
          : undefined,
        owner: req.user._id,
        status: "draft",
      });

      await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (owner or admin)
router.put(
  "/:id",
  [
    protect,
    checkOwnership("Product"),
    uploadMultiple,
    handleUploadError,
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Description must be between 10 and 2000 characters"),
    body("status")
      .optional()
      .isIn(["draft", "pending", "active", "funded", "closed", "suspended"])
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

      const product = req.resource;

      // Update fields
      const updateFields = [
        "title",
        "description",
        "shortDescription",
        "subcategory",
        "location",
        "specifications",
        "performance",
        "tags",
        "investmentPeriod",
      ];
      updateFields.forEach((field) => {
        if (req.body[field]) {
          if (
            typeof req.body[field] === "string" &&
            (req.body[field].startsWith("{") || req.body[field].startsWith("["))
          ) {
            product[field] = JSON.parse(req.body[field]);
          } else {
            product[field] = req.body[field];
          }
        }
      });

      // Handle status changes (only admin can change to active/funded)
      if (req.body.status && req.user.role === "admin") {
        product.status = req.body.status;
      }

      // Handle new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file, index) => ({
          url: getFileUrl(file),
          alt: `${product.title} image ${product.images.length + index + 1}`,
          isPrimary: product.images.length === 0 && index === 0,
        }));
        product.images.push(...newImages);
      }

      await product.save();

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Update product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (owner or admin)
router.delete(
  "/:id",
  [protect, checkOwnership("Product")],
  async (req, res) => {
    try {
      const product = req.resource;

      // Delete images from Cloudinary
      if (product.images.length > 0) {
        for (const image of product.images) {
          if (image.url.includes("cloudinary")) {
            const publicId = image.url.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId);
          }
        }
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
        message: "Failed to delete product",
      });
    }
  }
);

// @route   POST /api/products/:id/like
// @desc    Like/unlike product
// @access  Private
router.post(
  "/:id/like",
  [
    protect,
    rateLimit(10, 60000), // 10 likes per minute
  ],
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const isLiked = product.likes.includes(req.user._id);

      if (isLiked) {
        product.likes = product.likes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else {
        product.likes.push(req.user._id);
      }

      await product.save();

      res.json({
        success: true,
        message: isLiked ? "Product unliked" : "Product liked",
        data: {
          isLiked: !isLiked,
          likesCount: product.likes.length,
        },
      });
    } catch (error) {
      console.error("Like product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to like/unlike product",
      });
    }
  }
);

// @route   POST /api/products/:id/bookmark
// @desc    Bookmark/unbookmark product
// @access  Private
router.post(
  "/:id/bookmark",
  [
    protect,
    rateLimit(10, 60000), // 10 bookmarks per minute
  ],
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const user = await User.findById(req.user._id);
      const isBookmarked = product.bookmarks.includes(req.user._id);

      if (isBookmarked) {
        // Remove bookmark
        product.bookmarks = product.bookmarks.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
        user.bookmarkedProducts = user.bookmarkedProducts.filter(
          (id) => id.toString() !== req.params.id
        );
      } else {
        // Add bookmark
        product.bookmarks.push(req.user._id);
        user.bookmarkedProducts.push(req.params.id);
      }

      await product.save();
      await user.save();

      res.json({
        success: true,
        message: isBookmarked
          ? "Product removed from bookmarks"
          : "Product bookmarked",
        data: {
          isBookmarked: !isBookmarked,
          bookmarksCount: product.bookmarks.length,
        },
      });
    } catch (error) {
      console.error("Bookmark product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to bookmark/unbookmark product",
      });
    }
  }
);

// @route   PUT /api/products/:id/status
// @desc    Update product status (admin only)
// @access  Private (admin)
router.put(
  "/:id/status",
  [
    protect,
    adminOrModerator,
    body("status")
      .isIn(["draft", "pending", "active", "funded", "closed", "suspended"])
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
        message: "Product status updated successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Update product status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product status",
      });
    }
  }
);

// @route   POST /api/products/:id/publish
// @desc    Publish draft product (owner only)
// @access  Private (owner)
router.post(
  "/:id/publish",
  [protect, checkOwnership("Product")],
  async (req, res) => {
    try {
      const product = req.resource;

      // Check if product is in draft status
      if (product.status !== "draft") {
        return res.status(400).json({
          success: false,
          message: "Only draft products can be published",
        });
      }

      // Validate that product has required fields for publishing
      if (
        !product.title ||
        !product.description ||
        !product.images ||
        product.images.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product must have title, description, and at least one image to be published",
        });
      }

      // Change status to active
      product.status = "active";
      product.publishedAt = new Date();

      await product.save();

      res.json({
        success: true,
        message: "Product published successfully",
        data: { product },
      });
    } catch (error) {
      console.error("Publish product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish product",
      });
    }
  }
);

export default router;
