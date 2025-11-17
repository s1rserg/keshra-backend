import { registerAs } from '@nestjs/config';

export const cloudinaryConfiguration = registerAs('cloudinary-config', () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
}));
