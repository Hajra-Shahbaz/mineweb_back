import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const regionStr = process.env.AWS_REGION || 'ap-southeast-2';
const bucketStr = process.env.AWS_BUCKET_NAME || '';

// Create the authenticated S3 Client instance safely
const s3 = new S3Client({
  region: regionStr,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Uploads an in-memory file buffer directly to your Amazon S3 Bucket
 * @param file - The raw Express.Multer.File object from the middleware layer
 * @param folder - Destination path folder inside the bucket (e.g., 'avatars', 'projects')
 */
export const uploadFileToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  // Replace spaces with hyphens to make the filename URL-safe
  const cleanFileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: bucketStr,
    Key: cleanFileName,
    Body: file.buffer,          // The binary file data stored by Multer
    ContentType: file.mimetype, // Allows files to view/render online instead of forcing download
  };

  // Dispatch the upload command across the network
  await s3.send(new PutObjectCommand(uploadParams));

  // Construct and pass back the live web URL string securely
  return `https://${bucketStr}.s3.${regionStr}.amazonaws.com/${cleanFileName}`;
};

/**
 * Deletes a file from S3 using its URL
 * @param fileUrl - The full URL of the file to delete
 * @returns Promise<void>
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the key from the URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/folder/filename.jpg
    const urlObj = new URL(fileUrl);
    // Remove the leading slash to get the key
    const key = urlObj.pathname.substring(1);
    
    const deleteParams = {
      Bucket: bucketStr,
      Key: key,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`✅ Successfully deleted file from S3: ${key}`);
  } catch (error) {
    console.error('❌ Error deleting file from S3:', error);
    throw error;
  }
};

/**
 * Extracts the S3 key from a URL
 * @param fileUrl - The full S3 URL
 * @returns The S3 key
 */
export const extractKeyFromUrl = (fileUrl: string): string => {
  const urlObj = new URL(fileUrl);
  return urlObj.pathname.substring(1);
};