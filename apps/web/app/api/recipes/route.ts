/**
 * Next.js の Route Handler (BFF プロキシ)
 *
 * クライアント (`/api/recipes?category=...`) → ここ → Hono バックエンド (`${API_URL}/api/recipes`)
 *
 * /api/search と同じ BFF パターン:
 *  - クライアントは同一オリジンの相対パスを叩く (CORS 不要)
 *  - バックエンド URL を露出しない
 *  - 必要に応じて認証ヘッダ追加・キャッシング等を挟める
 */
import type { NextRequest } from "next/server";

// recipes テーブルのレシピ 1 件 (材料・手順をネスト)
export type Ingredient = {
  name: string;
  amount: string | null;
  unit: string | null;
};

export type RecipeStep = {
  step_number: number;
  description: string;
};

export type Recipe = {
  recipe_id: string; // UUID — 詳細ページ /recipes/[slug] へのリンクに使う
  name: string;
  category: string;
  image_path: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
};

// /api/recipes のレスポンス全体 (バックエンド側の `{ response: [...] }` 形式に追従)
// TODO: バックエンド側で `{ data: [...] }` などに統一されたら追従する
export type RecipesResponse = {
  response: Recipe[];
};

// /api/recipes/:id (詳細) のレスポンス
export type RecipeDetailResponse = {
  data: Recipe;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(request: NextRequest) {
  // category クエリだけをそのまま転送する
  const category = request.nextUrl.searchParams.get("category");
  if (!category) {
    return Response.json({ error: "category is required" }, { status: 400 });
  }

  const upstream = await fetch(
    `${API_URL}/api/recipes?category=${encodeURIComponent(category)}`,
  );

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
