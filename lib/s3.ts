/**
 * Optimized S3 Integration
 * Features: Retry logic, error handling, connection pooling
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function retryS3Operation<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries) {
        console.warn(`S3 operation attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
        delay = Math.min(delay * 2, config.maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Upload file to S3 with retry logic
 */
export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;

  return retryS3Operation(async () => {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: getContentType(fileName),
      CacheControl: 'max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(command);
    return key; // Return the cloud_storage_path
  });
}

/**
 * Get signed URL for file download with retry logic
 */
export async function downloadFile(key: string, expiresIn: number = 3600): Promise<string> {
  return retryS3Operation(async () => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  });
}

/**
 * Delete file from S3 with retry logic
 */
export async function deleteFile(key: string): Promise<void> {
  return retryS3Operation(async () => {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  });
}

/**
 * Get content type from file name
 */
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Batch upload multiple files
 */
export async function uploadFiles(
  files: Array<{ buffer: Buffer; fileName: string }>
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadFile(file.buffer, file.fileName)));
}

/**
 * Batch delete multiple files
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFile(key)));
}
