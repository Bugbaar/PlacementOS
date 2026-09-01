import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

const requiredConfigs = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingConfigs = requiredConfigs.filter(key => !process.env[key]);

if (missingConfigs.length === 0) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadBuffer = async (buffer, folder = 'placementos') => {
  if (missingConfigs.length > 0) {
    throw new Error(`Cloudinary not configured. Missing: ${missingConfigs.join(', ')}. Please add to .env file.`);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          logger.error({ event: 'cloudinary_upload_error', error: error.message });
          return reject(new Error('Cloudinary upload failed. Please try again.'));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export default { cloudinary, uploadBuffer };
