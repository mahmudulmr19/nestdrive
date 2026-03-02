import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "~/config/env";

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/** Generate a pre-signed URL to upload a file directly from the browser (5 min expiry). */
export const generatePresignedPutUrl = (key: string, mimeType: string) => {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
};

/** Generate a pre-signed URL to download / preview a file (1 hour expiry). */
export const generatePresignedGetUrl = (key: string) => {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
};

/** Permanently delete an object from S3. */
export const deleteS3Object = (key: string) => {
  return s3.send(
    new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
  );
};
