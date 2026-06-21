import { Storage } from '@google-cloud/storage';

/**
 * GCS Storage Client singleton
 * Automatically uses credentials from environment variables:
 * - GOOGLE_APPLICATION_CREDENTIALS (path to JSON key file)
 * Or GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY
 */
export const gcsStorage = new Storage({
  ...(process.env.GCS_PROJECT_ID
    ? { projectId: process.env.GCS_PROJECT_ID }
    : {}),
  ...(process.env.GCS_KEY_FILE
    ? { keyFilename: process.env.GCS_KEY_FILE }
    : {}),
});

/**
 * GCS Configuration
 */
const DEFAULT_UPLOAD_EXPIRY = 300; // 5 minutes
const rawUploadExpiry = process.env.GCS_UPLOAD_EXPIRY;
const parsedUploadExpiry = Number.parseInt(
  rawUploadExpiry != null && rawUploadExpiry !== ''
    ? rawUploadExpiry
    : String(DEFAULT_UPLOAD_EXPIRY),
  10
);

const uploadExpiry =
  Number.isNaN(parsedUploadExpiry) || parsedUploadExpiry <= 0
    ? DEFAULT_UPLOAD_EXPIRY
    : parsedUploadExpiry;

export const gcsConfig = {
  publicBucketName: process.env.GCS_PUBLIC_BUCKET || 'joblyai-public',
  privateBucketName: process.env.GCS_PRIVATE_BUCKET || 'joblyai-private',
  uploadExpiry, // in seconds
};
