import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const regionStr = process.env.AWS_REGION || 'ap-southeast-2';
const bucketStr = process.env.AWS_BUCKET_NAME || '';

// Create the authenticated S3 Client instance
const s3 = new S3Client({
  region: regionStr,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Uploads an in-memory file buffer directly to your Amazon S3 Bucket
 */
export const uploadFileToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (!file || !file.buffer) {
    throw new Error('No file or file buffer provided');
  }

  // Clean the filename
  const cleanFileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: bucketStr,
    Key: cleanFileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${bucketStr}.s3.${regionStr}.amazonaws.com/${cleanFileName}`;
};

/**
 * Deletes a file from S3 using its URL
 */
export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    const urlObj = new URL(fileUrl);
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
 */
export const extractKeyFromUrl = (fileUrl: string): string => {
  const urlObj = new URL(fileUrl);
  return urlObj.pathname.substring(1);
};