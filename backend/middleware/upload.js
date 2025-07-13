import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure local storage for development
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Configure Cloudinary storage for production
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "squirell",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Create multer instances
const uploadToLocal = multer({
  storage: localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadToCloudinaryMulter = multer({
  storage: cloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Choose storage based on environment
const upload =
  process.env.NODE_ENV === "production"
    ? uploadToCloudinaryMulter
    : uploadToLocal;

// Single file upload
export const uploadSingle = upload.single("image");

// Multiple files upload
export const uploadMultiple = upload.array("images", 10);

// Fields upload (for different file types)
export const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "documents", maxCount: 5 },
]);

// Specific upload for product images
export const uploadProductImages = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "additionalImages", maxCount: 9 },
]);

// Specific upload for user avatars
export const uploadAvatar = multer({
  storage:
    process.env.NODE_ENV === "production" ? cloudinaryStorage : localStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
}).single("avatar");

// Error handling middleware
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 10 files.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// Helper function to get file URL
export const getFileUrl = (file) => {
  if (process.env.NODE_ENV === "production") {
    return file.path; // Cloudinary returns the URL in the path field
  } else {
    return `/uploads/${file.filename}`;
  }
};

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = "squirell") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
  });
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadProductImages,
  uploadAvatar,
  handleUploadError,
  deleteFromCloudinary,
  getFileUrl,
  uploadToCloudinary,
  getOptimizedImageUrl,
};
