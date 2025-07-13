import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Review content is required"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    category: {
      type: String,
      enum: ["general", "product", "service", "platform", "investment"],
      default: "general",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Author is optional for anonymous reviews
    },
    authorName: {
      type: String,
      required: [true, "Author name is required"],
    },
    authorEmail: {
      type: String,
      required: [true, "Author email is required"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: Date,
    moderationNotes: String,
    rejectionReason: String,
    helpful: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        isHelpful: {
          type: Boolean,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replies: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, "Reply content cannot exceed 500 characters"],
        },
        isOfficial: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
reviewSchema.index({ author: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ isFeatured: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ category: 1 });
reviewSchema.index({ sentiment: 1 });
reviewSchema.index({ "author.email": 1 });

// Virtual for helpful percentage
reviewSchema.virtual("helpfulPercentage").get(function () {
  const helpfulCount = this.helpfulCount || 0;
  const notHelpfulCount = this.notHelpfulCount || 0;
  const total = helpfulCount + notHelpfulCount;
  if (total === 0) return 0;
  return Math.round((helpfulCount / total) * 100);
});

// Virtual for total helpful votes
reviewSchema.virtual("totalHelpfulVotes").get(function () {
  const helpfulCount = this.helpfulCount || 0;
  const notHelpfulCount = this.notHelpfulCount || 0;
  return helpfulCount + notHelpfulCount;
});

// Virtual for review age
reviewSchema.virtual("ageInDays").get(function () {
  if (!this.createdAt) return 0;
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update helpful counts
reviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Update helpful counts from helpful array
  if (this.helpful && Array.isArray(this.helpful)) {
    this.helpfulCount = this.helpful.filter((h) => h.isHelpful).length;
    this.notHelpfulCount = this.helpful.filter((h) => !h.isHelpful).length;
  } else {
    this.helpfulCount = 0;
    this.notHelpfulCount = 0;
  }

  // Set publishedAt when status changes to approved
  if (
    this.isModified("status") &&
    this.status === "approved" &&
    !this.publishedAt
  ) {
    this.publishedAt = Date.now();
  }

  // Handle anonymous reviews
  if (this.authorName === "Anonymous User") {
    this.isVerified = false;
    this.author = undefined; // Remove author reference for anonymous reviews
  }

  next();
});

// Static method to find featured reviews
reviewSchema.statics.findFeatured = function (limit = 10) {
  return this.find({
    isFeatured: true,
    status: "approved",
  })
    .populate("author", "firstName lastName avatar")
    .populate("product", "title primaryImage")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find reviews by product
reviewSchema.statics.findByProduct = function (productId, options = {}) {
  const {
    status = "approved",
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 20,
    skip = 0,
  } = options;

  return this.find({
    product: productId,
    status,
  })
    .populate("author", "firstName lastName avatar")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to find reviews by author
reviewSchema.statics.findByAuthor = function (authorId, options = {}) {
  const {
    status = "approved",
    sortBy = "createdAt",
    sortOrder = "desc",
    limit = 20,
    skip = 0,
  } = options;

  return this.find({
    author: authorId,
    status,
  })
    .populate("product", "title primaryImage")
    .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics
reviewSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        totalApproved: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        totalPending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        totalRejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        totalFeatured: {
          $sum: { $cond: ["$isFeatured", 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      totalApproved: 0,
      totalPending: 0,
      totalRejected: 0,
      totalFeatured: 0,
    }
  );
};

// Instance method to mark as helpful/not helpful
reviewSchema.methods.markHelpful = async function (userId, isHelpful) {
  // Remove existing vote if any
  this.helpful = this.helpful.filter(
    (h) => h.user.toString() !== userId.toString()
  );

  // Add new vote
  this.helpful.push({
    user: userId,
    isHelpful,
    createdAt: new Date(),
  });

  await this.save();
  return this;
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
