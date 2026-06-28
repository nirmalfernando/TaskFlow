import { cloudinary } from '../config/cloudinary';
import { BadRequestError } from '../utils/errors';
import { env } from '../config/env.config';

export async function uploadAvatarToCloudinary(buffer: Buffer, userId: string): Promise<string> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new BadRequestError(
      'Avatar uploads are not configured on this server. Please add Cloudinary credentials.',
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'taskflow/avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        transformation: [
          { width: 256, height: 256, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message ?? 'Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(buffer);
  });
}

export async function deleteAvatarFromCloudinary(userId: string): Promise<void> {
  if (!env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(`taskflow/avatars/user_${userId}`).catch(() => {});
}

export async function uploadTaskImageToCloudinary(buffer: Buffer): Promise<string> {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new BadRequestError(
      'Image uploads are not configured on this server. Please add Cloudinary credentials.',
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'taskflow/task-images',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message ?? 'Upload failed'));
        } else {
          resolve(result.secure_url);
        }
      },
    );

    uploadStream.end(buffer);
  });
}
