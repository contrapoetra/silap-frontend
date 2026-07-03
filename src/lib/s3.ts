import { S3Client } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || 'ap-southeast-1';
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

export const S3_BUCKET = process.env.AWS_S3_BUCKET || '';
export const S3_REGION = REGION;
