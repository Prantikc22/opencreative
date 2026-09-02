import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucket = process.env.CLOUDFLARE_R2_BUCKET || "opencreative-media";

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing Cloudflare R2 credentials in .env.local");
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

// Bucket-scoped Object Read & Write tokens intentionally cannot call
// HeadBucket/CreateBucket/PutBucketCors. Verify exactly the object operations
// used by the app instead of requiring unnecessary account-admin privileges.
const key = `health/setup-${Date.now()}.txt`;
await client.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: "opencreative-r2-ok",
    ContentType: "text/plain",
  }),
);
const result = await client.send(
  new GetObjectCommand({ Bucket: bucket, Key: key }),
);
if ((await result.Body?.transformToString()) !== "opencreative-r2-ok") {
  throw new Error("R2 object verification returned unexpected content.");
}
await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

console.log(`R2 object storage for “${bucket}” is ready.`);
