import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Tenant-uploaded images are now all stored in S3 and served as presigned URLs. The Cloudinary
    // host below is LEGACY only: older item images saved before the S3 move may still hold
    // res.cloudinary.com URLs in production, so keep it until that data is migrated. S3 URLs are served as virtual-hosted
    // style URLs (https://{bucket}.s3.{region}.amazonaws.com/...). Exact hostname, matching how
    // the Cloudinary entry above is also exact — if the bucket or region ever changes (see
    // server/src/core/aws/config.ts's AWS_S3_BUCKET/AWS_REGION), update this too.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "busiman-prod-files.s3.ap-south-1.amazonaws.com" },
    ],
  },
};

export default nextConfig;
