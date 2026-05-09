/**
 * Next.js Route Handler (BFF プロキシ)
 *
 * クライアント (`/api/recipes/recent`) → ここ → Hono バックエンド
 * (`${API_URL}/api/recipes/recent`)
 *
 * 「ユーザーが投稿した料理たち」一覧 (= 最近追加されたレシピ) 用。
 * 一覧表示なので軽量レシピ情報 (recipe_id / name / category / image_path) のみ返す。
 */
import type { NextRequest } from "next/server";
import type { RecipeSummary } from "@/app/api/recipes/recent-searches/route";

export type RecentRecipesResponse = {
  response: RecipeSummary[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get("limit");
  const url = limit
    ? `${API_URL}/api/recipes/recent?limit=${encodeURIComponent(limit)}`
    : `${API_URL}/api/recipes/recent`;

  const upstream = await fetch(url, { cache: "no-store" });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
