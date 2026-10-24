import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_APY_KEY ??
    process.env.CLOUDINARY_CLOUD_APY_KEY,
  api_secret:
    process.env.CLOUDINARY_CLOUD_APY_SECRET ?? process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
