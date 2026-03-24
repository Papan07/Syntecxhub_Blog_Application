import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({ override: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinary() {
  try {
    console.log(`Checking connection for Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}...`);
    const result = await cloudinary.api.ping();
    console.log("SUCCESS! Cloudinary API is working perfectly.");
    console.log(result);
  } catch (error) {
    console.error("FAILURE! Cloudinary API keys are incorrect or invalid.");
    console.error("Error details:", error.message || error);
    process.exit(1);
  }
}

checkCloudinary();
