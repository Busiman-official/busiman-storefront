import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Tenant-uploaded product/logo images come from either of two hosts depending on when they
    // were uploaded: legacy item-level images are still Cloudinary; the newer per-variant
    // photos/videos (see InventoryVariant.media) are S3 presigned URLs, served as virtual-hosted
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
