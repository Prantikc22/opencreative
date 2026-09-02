import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket)
    throw new Error("R2 is not configured.");
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function client() {
  const c = config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: c.accessKeyId,
      secretAccessKey: c.secretAccessKey,
    },
  });
}

export async function uploadBuffer(
  key: string,
  body: Buffer,
  contentType: string,
  metadata?: Record<string, string>,
) {
  const { bucket } = config();
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    }),
  );
  return key;
}

export async function createUploadUrl(key: string, contentType: string) {
  const { bucket } = config();
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 900 },
  );
}

export async function createDownloadUrl(key: string) {
  const publicDomain =
    process.env.CLOUDFLARE_R2_PUBLIC_OR_CUSTOM_DOMAIN?.replace(/\/$/, "");
  if (publicDomain) return `${publicDomain}/${key}`;
  const { bucket } = config();
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 },
  );
}

export async function deleteObject(key: string) {
  const { bucket } = config();
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
