import Image from "next/image";
import { notFound } from "next/navigation";
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

/**
 * @deprecated 仮データ。サイドバーの「最近検索されたメニュー」は別途実装予定。
 */
const recentMenus = [
  { name: "リボンパスタのジェノベーゼ", link: "#", image: "/img-asparagus.png" },
  { name: "リボンパスタのジェノベーゼ", link: "#", image: "/img-asparagus.png" },
  { name: "リボンパスタのジェノベーゼ", link: "#", image: "/img-asparagus.png" },
  { name: "リボンパスタのジェノベーゼ", link: "#", image: "/img-asparagus.png" },
  { name: "リボンパスタのジェノベーゼ", link: "#", image: "/img-asparagus.png" },
];

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

  const res = await fetch(`${API_URL}/api/recipes/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    // レシピが存在しないので Next.js 標準の 404 経路へ
    notFound();
  }

  if (!res.ok) {
    // 400 (UUID 形式不正) / 500 (DB エラー) などはエラー境界に委譲
    throw new Error(`recipe 取得に失敗しました (HTTP ${res.status})`);
  }

  const { data: recipe } = (await res.json()) as RecipeDetailResponse;

  return (
    <main>
      <section className="py-30 flex flex-col w-full gap-20 mx-auto">
        <section>
          <div className="flex flex-col gap-4 w-250 mx-auto">
            <div className="flex items-center gap-8 w-full">
              {recipe.image_path && (
                <div className="relative cursor-pointer w-100 h-72 rounded-lg overflow-hidden drop-shadow-lg">
                  <Image
                    className="object-cover object-center"
                    src={recipe.image_path}
                    alt={recipe.name}
                    width={400}
                    height={287}
                  />
                </div>
              )}
              <div
                className="flex flex-col gap-6 flex-1 py-6 px-1"
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

            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold border-b pb-2">材料</h2>
              {/* API は材料をフラットなリストで返すのでグルーピングなしで表示 */}
              {/* 将来的に group 列が ingredients に追加されたらここをグループ表示に戻す */}
              <ul className="flex flex-col divide-y border rounded-lg overflow-hidden">
                {recipe.ingredients.map((item, j) => (
                  <li
                    key={j}
                    className="flex justify-between px-4 py-2 bg-white"
                  >
                    <span>{item.name}</span>
                    <span className="text-gray-500">{formatAmount(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold border-b pb-2">作り方</h2>
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
        </section>

        <section>
          <div className="flex flex-col gap-4 w-250 mx-auto">
            <h2
              className="flex items-end gap-2 text-2xl font-bold
                before:content-[''] before:block before:w-11 before:h-10 before:bg-[url('/title-cutlery.svg')] before:bg-contain before:bg-no-repeat"
            >
              最近検索されたメニュー
            </h2>
            <ul
              className="
                grid gap-6 w-full overflow-x-auto
                grid-flow-col
                auto-cols-[296px]
                p-2
                pb-8
                snap-x snap-mandatory
              "
            >
              {recentMenus.map((menu, index) => (
                <li
                  key={index}
                  className="grid grid-rows-[auto_1fr] drop-shadow-lg"
                >
                  <a className="contents" href={menu.link}>
                    <div className="relative w-full h-58 rounded-t-xl overflow-hidden">
                      <Image
                        className="object-cover object-center"
                        src={menu.image}
                        alt={menu.name}
                        fill
                        sizes="296px"
                      />
                    </div>
                    <span className="bg-white rounded-b-xl p-4">
                      {menu.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </main>
  );
}
