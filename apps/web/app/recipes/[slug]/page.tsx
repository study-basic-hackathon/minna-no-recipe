import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RecentSearchesResponse } from "@/app/api/recipes/recent-searches/route";
import type { Ingredient, RecipeDetailResponse } from "@/app/api/recipes/route";

/**
 * レシピ詳細ページ (Server Component)。
 *
 * URL: /recipes/[recipe_id]
 *  - [slug] というディレクトリ名だが受け取る値は recipe_id (UUID)
 *  - 命名は将来的に [id] にリネーム可
 *
 * フロー:
 *  - params.slug を recipe_id として `/api/recipes/:id` を取得
 *  - 404 → Next.js `notFound()` で標準 404 ページへ
 *  - 4xx/5xx → throw → app/error.tsx に委譲
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// バックエンドが応答しないときページ全体が固まるのを防ぐタイムアウト (ミリ秒)
const FETCH_TIMEOUT_MS = 10_000;

// API の Ingredient (name + amount + unit) を 1 行表示用文字列に整形する
function formatAmount(ingredient: Ingredient): string {
  const { amount, unit } = ingredient;
  if (amount && unit) return `${amount}${unit}`;
  if (amount) return amount;
  if (unit) return unit;
  return "";
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // レシピ詳細とサイドバーの「最近検索」は独立して取得できるので並列化
  // タイムアウト時は AbortError として throw → app/error.tsx に委譲
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let recipeRes: Response;
  let recentRes: Response;
  try {
    [recipeRes, recentRes] = await Promise.all([
      fetch(`${API_URL}/api/recipes/${slug}`, {
        cache: "no-store",
        signal: controller.signal,
      }),
      fetch(`${API_URL}/api/recipes/recent-searches?limit=5`, {
        cache: "no-store",
        signal: controller.signal,
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }

  // 404 (レシピなし) も 400 (UUID 形式不正) もユーザーから見れば
  // 「そんなレシピ無い」なので両方 notFound() に統合する。
  // 真のサーバー異常 (5xx 等) のみ Error Boundary に委譲。
  if (recipeRes.status === 404 || recipeRes.status === 400) {
    notFound();
  }

  if (!recipeRes.ok) {
    throw new Error(`recipe 取得に失敗しました (HTTP ${recipeRes.status})`);
  }

  if (!recentRes.ok) {
    throw new Error(
      `recent-searches 取得に失敗しました (HTTP ${recentRes.status})`,
    );
  }

  const { data: recipe } = (await recipeRes.json()) as RecipeDetailResponse;
  const { response: recentMenus } =
    (await recentRes.json()) as RecentSearchesResponse;

  return (
    <main>
      <section className="mx-auto flex w-full flex-col gap-20 py-30">
        <section>
          <div className="mx-auto flex w-250 flex-col gap-4
          max-[1000px]:w-full box-border max-[1000px]:px-4">
            <div className="flex w-full items-center justify-center gap-8
                max-[640px]:flex-col">
              {recipe.image_path && (
                <div className="relative w-100 cursor-pointer overflow-hidden rounded-lg drop-shadow-lg
                max-[768px]:flex-1 max-[768px]:w-auto
                max-[640px]:w-full">
                  <Image
                    className="h-auto w-full object-cover object-center"
                    src={recipe.image_path}
                    alt={recipe.name}
                    width={400}
                    height={287}
                  />
                </div>
              )}
              <div
                className="flex flex-1 flex-col gap-6 px-1 py-6"
                style={{
                  borderTop: "1px solid transparent",
                  borderBottom: "1px solid transparent",
                  borderImage:
                    "repeating-linear-gradient(to right, #E97D35 0 8px, transparent 8px 16px) 1",
                }}
              >
                <h2 className="text-3xl font-bold">{recipe.name}</h2>
                <p className="text-sm text-zinc-500">
                  カテゴリ: {recipe.category}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-12 pt-10">
              <div className="flex flex-col">
                <h2
                  className="relative inline-block w-fit pb-2
                  border-b-2 border-[#FCBB15]
                  text-2xl font-semibold
                  after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-6 after:bg-[#FE7210] after:content-['']
                  ">
                  材料
                </h2>
                {/* API は材料をフラットなリストで返すのでグルーピングなしで表示 */}
                {/* 将来的に group 列が ingredients に追加されたらここをグループ表示に戻す */}
                <ul className="flex flex-col overflow-hidden">
                  {recipe.ingredients.map((item, j) => (
                    <li
                      key={j}
                      className="flex justify-between border-b border-[#FCBB15] bg-white pt-4 pb-1"
                    >
                      <span>{item.name}</span>
                      <span className="text-gray-500">{formatAmount(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <h2
                  className="relative inline-block w-fit pb-2
                  border-b-2 border-[#FCBB15]
                  text-2xl font-semibold
                  after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-6 after:bg-[#FE7210] after:content-['']
                  ">
                  作り方
                </h2>
                <ol className="flex flex-col gap-3">
                  {recipe.steps.map((step) => (
                    <li key={step.step_number} className="flex gap-3">
                      <span className="font-bold text-[#E97D35]">
                        {step.step_number}.
                      </span>
                      <p className="leading-relaxed">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto flex w-250 flex-col gap-4
          max-[1000px]:w-full box-border max-[1000px]:pl-4 max-[640px]:pl-4 max-[640px]:pr-0">
            <h2 className="flex items-end gap-2 text-2xl font-bold before:block before:h-10 before:w-11 before:bg-[url('/title-cutlery.svg')] before:bg-contain before:bg-no-repeat before:content-['']">
              最近検索されたメニュー
            </h2>
            {recentMenus.length === 0 ? (
              <p className="text-zinc-700">
                まだ検索履歴がありません。
              </p>
            ) : (
              <ul className="grid w-full snap-x snap-mandatory auto-cols-[296px] grid-flow-col gap-6 overflow-x-auto p-2 pb-8
              max-[1000px]:pr-6">
                {recentMenus.map((menu) => (
                  <li
                    key={menu.recipe_id}
                    className="grid grid-rows-[auto_1fr] drop-shadow-lg"
                  >
                    <Link
                      className="contents"
                      href={`/recipes/${menu.recipe_id}`}
                    >
                      {menu.image_path && (
                        <div className="relative h-58 w-full overflow-hidden rounded-t-xl">
                          <Image
                            className="object-cover object-center"
                            src={menu.image_path}
                            alt={menu.name}
                            fill
                            sizes="296px"
                          />
                        </div>
                      )}
                      <span className="rounded-b-xl bg-white p-4">
                        {menu.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
