import "server-only";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

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

export async function uploadImageCloudinaryFromFile(
  file: File,
  image_id: string
) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        public_id: image_id,
        filename_override: image_id,
      },
      (error, result) => {
        if (error) {
          console.error("Upload error", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export default cloudinary;
