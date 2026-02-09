import { S3Client } from '@aws-sdk/client-s3';

export const minioClient = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID || 'jobly',
    secretAccessKey: process.env.AWS_ACCESS_KEY || 'jobly'
  },
  forcePathStyle: true, // IMPORTANT, for MinIO compatibility
});