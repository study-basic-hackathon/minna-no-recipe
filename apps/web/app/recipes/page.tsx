import Image from "next/image";
import Link from "next/link";
import type { RecipesResponse } from "@/app/api/recipes/route";

/**
 * カテゴリ別レシピ一覧ページ (Server Component)。
 *
 * URL: /recipes?category=fusilli
 *
 * フロー:
 *  - searchParams から category を取得
 *  - サーバー側で /api/recipes (バックエンド) を直接 fetch
 *  - 取得したレシピを一覧表示。各カードは詳細ページ /recipes/[id] へリンク
 *
 * エラーハンドリング:
 *  - category 未指定 → 案内文 (非エラー扱い)
 *  - 結果 0 件 → 「該当なし」案内文 (非エラー)
 *  - fetch 失敗や 4xx/5xx → throw → app/error.tsx に委譲
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// バックエンドが応答しないときページ全体が固まるのを防ぐタイムアウト (ミリ秒)
const FETCH_TIMEOUT_MS = 10_000;

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function RecipesPage({ searchParams }: Props) {
  const { category } = await searchParams;

  if (!category) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-zinc-700">
          カテゴリが指定されていません。トップページから検索してください。
        </p>
      </main>
    );
  }

  // Server Component なのでバックエンドに直接アクセス (BFF を経由しない)
  // cache: "no-store" は毎回最新を取得するため
  // タイムアウト時は AbortError として throw → app/error.tsx に委譲
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(
      `${API_URL}/api/recipes?category=${encodeURIComponent(category)}`,
      { cache: "no-store", signal: controller.signal },
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    // 4xx / 5xx は app/error.tsx に委譲
    throw new Error(`recipes 取得に失敗しました (HTTP ${res.status})`);
  }

  const data = (await res.json()) as RecipesResponse;
  const recipes = data.response;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-2 text-2xl font-semibold">「{category}」の検索結果</h1>
      <p className="mb-8 text-sm text-zinc-500">
        {recipes.length} 件見つかりました
      </p>

      {recipes.length === 0 ? (
        <p className="text-zinc-700">
          該当するレシピがまだ登録されていません。レシピを投稿してください。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 max-[1000px]:grid-cols-3">
          {recipes.map((recipe) => (
            <li
              key={recipe.recipe_id}
              className="overflow-hidden rounded-xl bg-white shadow-md"
            >
              <Link
                href={`/recipes/${recipe.recipe_id}`}
                className="block transition hover:opacity-80"
              >
                {recipe.image_path && (
                  <div className="relative aspect-[3/2] w-full">
                    <Image
                      src={recipe.image_path}
                      alt={recipe.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{recipe.name}</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    材料 {recipe.ingredients.length} 件 / 手順{" "}
                    {recipe.steps.length} 件
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
