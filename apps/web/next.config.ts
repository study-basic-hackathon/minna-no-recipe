import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage の public バケットから配信される画像を許可する
    // 環境ごとにプロジェクトサブドメインが変わるため "*.supabase.co" でワイルドカード指定
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
