import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          alt: String,
          isPrimary: {
            type: Boolean,
            default: false,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
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
      ],
    },
    assetType: {
      type: String,
      required: [true, "Asset type is required"],
      enum: ["real-estate", "art", "collectibles", "commodities", "other"],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    totalValue: {
      type: Number,
      required: [true, "Total asset value is required"],
      min: [1000, "Asset value must be at least $1,000"],
    },
    sharePrice: {
      type: Number,
      required: [true, "Share price is required"],
      min: [1, "Share price must be at least $1"],
    },
    totalShares: {
      type: Number,
      required: [true, "Total shares is required"],
      min: [1, "Total shares must be at least 1"],
    },
    availableShares: {
      type: Number,
      required: [true, "Available shares is required"],
      min: [0, "Available shares cannot be negative"],
    },
    minimumInvestment: {
      type: Number,
      required: [true, "Minimum investment is required"],
      min: [1, "Minimum investment must be at least $1"],
    },
    maximumInvestment: {
      type: Number,
      min: [1, "Maximum investment must be at least $1"],
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    specifications: {
      size: {
        value: Number,
        unit: {
          type: String,
          enum: ["sqft", "sqm", "acres", "hectares", "pieces", "units"],
        },
      },
      yearBuilt: Number,
      condition: {
        type: String,
        enum: ["excellent", "good", "fair", "poor", "new"],
      },
      features: [String],
      amenities: [String],
    },
    documents: [
      {
        name: String,
        url: String,
        type: {
          type: String,
          enum: ["deed", "appraisal", "insurance", "maintenance", "other"],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    performance: {
      annualReturn: {
        type: Number,
        min: [-100, "Annual return cannot be less than -100%"],
        max: [1000, "Annual return cannot exceed 1000%"],
      },
      projectedReturn: {
        type: Number,
        min: [-100, "Projected return cannot be less than -100%"],
        max: [1000, "Projected return cannot exceed 1000%"],
      },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      liquidityScore: {
        type: Number,
        min: [1, "Liquidity score must be at least 1"],
        max: [10, "Liquidity score cannot exceed 10"],
        default: 5,
      },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "active", "funded", "closed", "suspended"],
      default: "draft",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product owner is required"],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    investmentPeriod: {
      startDate: Date,
      endDate: Date,
      duration: {
        type: Number,
        min: [1, "Investment duration must be at least 1 month"],
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    investors: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        shares: {
          type: Number,
          required: true,
          min: [1, "Shares must be at least 1"],
        },
        investmentAmount: {
          type: Number,
          required: true,
          min: [0, "Investment amount cannot be negative"],
        },
        investedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    soldShares: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    searchKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: Date,
    fundedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
productSchema.index({ title: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ assetType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ owner: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ "location.city": 1 });
productSchema.index({ "location.country": 1 });
productSchema.index({ totalValue: -1 });
productSchema.index({ sharePrice: 1 });

// Virtual for calculating funding percentage
productSchema.virtual("fundingPercentage").get(function () {
  if (!this.totalShares || this.totalShares === 0) return 0;
  const soldShares = this.totalShares - (this.availableShares || 0);
  return Math.round((soldShares / this.totalShares) * 100);
});

// Virtual for calculating total invested
productSchema.virtual("totalInvested").get(function () {
  if (!this.totalShares || !this.sharePrice) return 0;
  const soldShares = this.totalShares - (this.availableShares || 0);
  return soldShares * this.sharePrice;
});

// Virtual for calculating remaining investment
productSchema.virtual("remainingInvestment").get(function () {
  if (!this.availableShares || !this.sharePrice) return 0;
  return this.availableShares * this.sharePrice;
});

// Virtual for primary image
productSchema.virtual("primaryImage").get(function () {
  if (!this.images || !Array.isArray(this.images)) {
    return null;
  }
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0] ? this.images[0].url : null;
});

// Method to update sold shares
productSchema.methods.updateSoldShares = function () {
  this.soldShares = this.totalShares - this.availableShares;
  return this.save();
};

// Method to check if product is fully funded
productSchema.methods.isFullyFunded = function () {
  return this.availableShares === 0;
};

// Method to add investor
productSchema.methods.addInvestor = function (userId, shares, amount) {
  if (!this.investors) {
    this.investors = [];
  }

  const existingInvestor = this.investors.find(
    (inv) => inv.user.toString() === userId.toString()
  );

  if (existingInvestor) {
    existingInvestor.shares += shares;
    existingInvestor.investmentAmount += amount;
  } else {
    this.investors.push({
      user: userId,
      shares,
      investmentAmount: amount,
    });
  }

  this.availableShares -= shares;
  this.soldShares += shares;

  return this.save();
};

// Pre-save middleware to update sold shares
productSchema.pre("save", function (next) {
  this.soldShares = this.totalShares - this.availableShares;
  this.updatedAt = Date.now();

  // Set publishedAt when status changes to active
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.publishedAt
  ) {
    this.publishedAt = Date.now();
  }

  // Set fundedAt when status changes to funded
  if (this.isModified("status") && this.status === "funded" && !this.fundedAt) {
    this.fundedAt = Date.now();
  }

  next();
});

// Static method to find featured products
productSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    $or: [{ isFeatured: true, status: "active" }, { status: "active" }],
  })
    .populate("owner", "firstName lastName avatar")
    .sort({ isFeatured: -1, createdAt: -1 }) // Featured products first, then by creation date
    .limit(limit);
};

// Static method to find products by category
productSchema.statics.findByCategory = function (
  category,
  limit = 20,
  skip = 0
) {
  return this.find({
    category,
    status: "active",
  })
    .populate("owner", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to search products
productSchema.statics.search = function (query, options = {}) {
  const {
    assetType,
    category,
    minPrice,
    maxPrice,
    minValue,
    maxValue,
    location,
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 20,
    skip = 0,
    userId, // Add userId parameter to include user's draft products
  } = options;

  let searchQuery = { status: "active" };

  // If user is authenticated, also include their draft products
  if (userId) {
    searchQuery = {
      $or: [{ status: "active" }, { status: "draft", owner: userId }],
    };
  }

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Filters
  if (assetType) searchQuery.assetType = assetType;
  if (category) searchQuery.category = category;
  if (minPrice || maxPrice) {
    searchQuery.sharePrice = {};
    if (minPrice) searchQuery.sharePrice.$gte = minPrice;
    if (maxPrice) searchQuery.sharePrice.$lte = maxPrice;
  }
  if (minValue || maxValue) {
    searchQuery.totalValue = {};
    if (minValue) searchQuery.totalValue.$gte = minValue;
    if (maxValue) searchQuery.totalValue.$lte = maxValue;
  }
  if (location) {
    searchQuery["location.city"] = new RegExp(location, "i");
  }

  return this.find(searchQuery)
    .populate("owner", "firstName lastName avatar")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

const Product = mongoose.model("Product", productSchema);

export default Product;
