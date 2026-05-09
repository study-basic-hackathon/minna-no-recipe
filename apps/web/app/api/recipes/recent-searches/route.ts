/**
 * Next.js Route Handler (BFF プロキシ)
 *
 * クライアント (`/api/recipes/recent-searches`) → ここ → Hono バックエンド
 * (`${API_URL}/api/recipes/recent-searches`)
 *
 * 「最近検索されたメニュー」一覧用 - 一覧画面の表示に必要な軽量レシピ情報を返す
 * (ingredients / steps はネストせず recipe の基本情報のみ)
 */
import type { NextRequest } from "next/server";

// 一覧表示用の軽量レシピ (ingredients / steps は含まない)
export type RecipeSummary = {
  recipe_id: string;
  name: string;
  category: string;
  image_path: string | null;
};

export type RecentSearchesResponse = {
  response: RecipeSummary[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  // limit クエリだけそのまま転送 (バックエンド側で 1〜50 にクランプされる)
  const limit = request.nextUrl.searchParams.get("limit");
  const url = limit
    ? `${API_URL}/api/recipes/recent-searches?limit=${encodeURIComponent(limit)}`
    : `${API_URL}/api/recipes/recent-searches`;

  const upstream = await fetch(url, { cache: "no-store" });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
