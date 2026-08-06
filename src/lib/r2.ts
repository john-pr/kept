import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function getClient(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 is not configured. Missing R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

function getBucketName(): string {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 is not configured. Missing R2_BUCKET_NAME.");
  }
  return R2_BUCKET_NAME;
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: getBucketName(), Key: key }));
}

export async function getObjectFromR2(key: string) {
  const client = getClient();
  return client.send(new GetObjectCommand({ Bucket: getBucketName(), Key: key }));
}

export function getPublicUrl(key: string): string {
  if (!R2_PUBLIC_URL) {
    throw new Error("R2 is not configured. Missing R2_PUBLIC_URL.");
  }
  return `${R2_PUBLIC_URL}/${key}`;
}

/** Extracts the object key from a public R2 URL produced by getPublicUrl. */
export function getKeyFromPublicUrl(url: string): string | null {
  if (!R2_PUBLIC_URL) return null;
  const prefix = `${R2_PUBLIC_URL}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}