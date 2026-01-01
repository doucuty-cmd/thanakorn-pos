import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "udxxppwuunevsaeueypo.supabase.co", // โดเมน Supabase ของคุณ
      },
    ],
  },
};

export default nextConfig;