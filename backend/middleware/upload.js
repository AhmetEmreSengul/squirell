import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Debug: Print Cloudinary config at upload setup
console.log("Cloudinary config at upload setup:", cloudinary.config());

// Main product image storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

// Avatar storage (separate folder)
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

export const uploadSingle = upload.single("images");
export const uploadMultiple = upload.array("images", 10);
export const uploadProductImages = upload.array("images", 10);
export const uploadAvatar = multer({ storage: avatarStorage }).single("avatar");

export function getFileUrl(file) {
  return file.path;
}

export async function deleteFromCloudinary(publicId) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export function handleUploadError(error, req, res, next) {
  if (error) {
    console.error("UPLOAD ERROR:", error); // Log the actual error for debugging
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message || "File upload error.",
    });
  }
  next();
}

export default upload;
