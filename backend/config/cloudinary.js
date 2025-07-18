import dotenv from "dotenv";

dotenv.config({ path: "./.env" }); // This must be first!

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});



if (
  !process.env.CLOUDINARY_URL &&
  (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET)
) {
  console.warn(
    "[Cloudinary] Warning: No Cloudinary credentials found. Please set CLOUDINARY_URL or all of CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
  );
}

export default cloudinary;
