import type { NextConfig } from "next";

// プロジェクト固有の Supabase ホスト。
// .env の SUPABASE_URL から派生して許可ドメインを限定する (全テナント許可は避ける)。
// 環境変数が無い場合 (CI のビルド時など) は本番投入できない値にして fail させない。
const SUPABASE_HOSTNAME = (() => {
  const raw = process.env.SUPABASE_URL;
  if (!raw) {
    // ビルド時に SUPABASE_URL が無いと Image 設定が空になる。
    // 既存のプロジェクトホストをフォールバックとしてハードコード。
    return "vjxsqbakfbxtfrjrwqlh.supabase.co";
  }
  try {
    return new URL(raw).hostname;
  } catch {
    return "vjxsqbakfbxtfrjrwqlh.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage の public バケットから配信される画像のみ許可。
    remotePatterns: [
      {
        protocol: "https",
        hostname: SUPABASE_HOSTNAME,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
