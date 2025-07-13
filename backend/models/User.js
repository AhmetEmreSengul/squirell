import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.appleId; // Password required only for local auth
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      default: "prefer-not-to-say",
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: String,
    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    appleId: {
      type: String,
      sparse: true,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    portfolioValue: {
      type: Number,
      default: 0,
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      twoFactorAuth: {
        type: Boolean,
        default: false,
      },
    },
    bookmarkedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    likedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    kycDocuments: [
      {
        type: {
          type: String,
          enum: ["passport", "drivers-license", "national-id"],
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        verifiedAt: Date,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
userSchema.virtual("displayName").get(function () {
  return this.fullName || this.email;
});

// Index for better query performance
// Note: email index is already created by unique: true in schema
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = token;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Virtual for user's full profile URL
userSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) {
    return this.avatar.startsWith("http")
      ? this.avatar
      : `/uploads/avatars/${this.avatar}`;
  }
  return "/uploads/avatars/default-avatar.png";
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

// Static method to find by email or OAuth ID
userSchema.statics.findByEmailOrOAuthId = function (
  email,
  googleId = null,
  appleId = null
) {
  const query = { $or: [{ email }] };
  if (googleId) query.$or.push({ googleId });
  if (appleId) query.$or.push({ appleId });
  return this.findOne(query);
};

const User = mongoose.model("User", userSchema);

export default User;
