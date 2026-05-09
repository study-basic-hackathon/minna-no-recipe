import Image from "next/image";
import Link from "next/link";
import type { RecentRecipesResponse } from "@/app/api/recipes/recent/route";
import type { RecentSearchesResponse } from "@/app/api/recipes/recent-searches/route";
import { HomeUploadSection } from "../components/HomeUploadSection";

import RecipeCard from "../components/RecipeCard";

// 「今月のおすすめメニュー」のリンク先 recipe_id (運営キュレーションのため固定)
// DB に投入済み: name='ベーコンのアスパラ巻き', category='asparagus'
const MONTHLY_FEATURED_RECIPE_ID = "81fc2557-a3fb-4cd0-92b3-54b8ee847e15";

// Server Component から自分自身 (Next.js 側 BFF) を fetch すると build 時の
// prerender で失敗するため、ここではバックエンドに直接アクセスする。
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * @deprecated 仮データ。API 完成後に削除し、サーバーから取得するように差し替える。
 */
const steps = [
  {
    title: "写真をアップロード",
    icon: "/icon-photo.svg",
    desc: "レシピを知りたい写真を下記からアップロードしてください",
  },
  {
    title: "類似レシピを検索",
    icon: "/icon-search.svg",
    desc: "アップロードされた画像から推測されるレシピを紹介します",
  },
  {
    title: "レシピで料理を再現",
    icon: "/icon-dishes.svg",
    desc: "再現してみた料理を投稿して他の人にもシェアしよう！",
  },
];

// バックエンドが応答しないときページ全体が固まるのを防ぐタイムアウト (ミリ秒)
const FETCH_TIMEOUT_MS = 10_000;

export default async function Home() {
  // 「最近検索」と「最近追加 (= ユーザー投稿)」は独立した取得なので Promise.all で並列化。
  // 4xx/5xx は throw → app/error.tsx に委譲。タイムアウト時は AbortError として伝搬。
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let recentSearchesRes: Response;
  let recentRecipesRes: Response;
  try {
    [recentSearchesRes, recentRecipesRes] = await Promise.all([
      fetch(`${API_URL}/api/recipes/recent-searches?limit=5`, {
        cache: "no-store",
        signal: controller.signal,
      }),
      fetch(`${API_URL}/api/recipes/recent?limit=7`, {
        cache: "no-store",
        signal: controller.signal,
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!recentSearchesRes.ok) {
    throw new Error(
      `recent-searches 取得に失敗しました (HTTP ${recentSearchesRes.status})`,
    );
  }
  if (!recentRecipesRes.ok) {
    throw new Error(
      `recent recipes 取得に失敗しました (HTTP ${recentRecipesRes.status})`,
    );
  }

  const recentSearchesData =
    (await recentSearchesRes.json()) as RecentSearchesResponse;
  const recentRecipesData =
    (await recentRecipesRes.json()) as RecentRecipesResponse;
  const recentMenus = recentSearchesData.response;
  const works = recentRecipesData.response;

  return (
    <main>
      <section className="bg-[url('/bg-search.webp')] bg-cover bg-center bg-no-repeat pt-41 pb-20">
        <div className="mx-auto flex w-250 flex-col items-center justify-center gap-7">
          <HomeUploadSection />
        </div>
      </section>
      <section className="bg-[#FFF9EB] py-20">
        <div className="mx-auto flex w-250 flex-col items-center justify-center gap-6">
          <div className="flex w-250 flex-col items-center justify-center gap-2">
            <h2 className="text-3xl font-bold text-[#FE8C12]">
              写真からレシピを見つけよう
            </h2>
            <div className="text-center">
              <p>
                気になる料理の写真をアップロードするだけで、類似したレシピを簡単に検索できます。
              </p>
              <p>
                旅行先で食べた料理や、人気のカフェメニューを自宅で再現してみませんか？
              </p>
            </div>
          </div>
          <ol className="flex w-full gap-10">
            {steps.map((step, i) => (
              <RecipeCard key={i} step={step} i={i} />
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto flex w-full flex-col gap-20 py-30">
        <section>
          <div className="mx-auto flex w-250 flex-col gap-4">
            <h2 className="flex items-end gap-2 text-2xl font-bold before:block before:h-10 before:w-11 before:bg-[url('/title-crown.svg')] before:bg-contain before:bg-no-repeat before:content-['']">
              今月のおすすめメニュー
            </h2>
            {/* 今月のおすすめは表示自体は固定 (運営キュレーション扱い)。 */}
            {/* リンク先のみ DB に存在する実レシピ ID を指す。 */}
            {/* TODO: 月替わりで対象を入れ替える運用が決まったら featured フラグや別テーブルに置き換える */}
            <div className="flex w-full items-center gap-8">
              <Link
                href={`/recipes/${MONTHLY_FEATURED_RECIPE_ID}`}
                className="relative h-72 w-100 cursor-pointer overflow-hidden rounded-lg drop-shadow-lg"
              >
                <Image
                  className="object-cover object-center"
                  src="/img-asparagus.png"
                  alt={"今月のおすすめメニュー"}
                  width={400}
                  height={287}
                />
                <span className="absolute bottom-0 left-0 w-full bg-white/90 p-4">
                  ベーコンのアスパラ巻き
                </span>
              </Link>
              <div
                className="flex flex-1 flex-col items-end gap-6 px-1 py-6"
                style={{
                  borderTop: "1px solid transparent",
                  borderBottom: "1px solid transparent",
                  borderImage:
                    "repeating-linear-gradient(to right, #E97D35 0 8px, transparent 8px 16px) 1",
                }}
              >
                <p className="leading-[1.8]">
                  春から初夏にかけて旬を迎えるアスパラガスは、みずみずしく甘みが強いのが特徴です。特に北海道や長野県産が有名で、昼夜の寒暖差によってやわらかく風味豊かに育ちます。ベーコンで巻いて焼くことで、アスパラのシャキッとした食感と自然な甘さに、ベーコンの塩気と旨みが重なり、シンプルながら満足感のある一品に仕上がります。旬の味わいをぜひ楽しんでみてください。
                </p>
                <Link
                  href={`/recipes/${MONTHLY_FEATURED_RECIPE_ID}`}
                  className="font-semibold text-[#E97D35] transition-all duration-100 hover:underline"
                >
                  →レシピを見る
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="mx-auto flex w-250 flex-col gap-4">
            <h2 className="flex items-end gap-2 text-2xl font-bold before:block before:h-10 before:w-11 before:bg-[url('/title-cutlery.svg')] before:bg-contain before:bg-no-repeat before:content-['']">
              最近検索されたメニュー
            </h2>
            {recentMenus.length === 0 ? (
              <p className="text-zinc-700">
                まだ検索履歴がありません。レシピを検索してみてください。
              </p>
            ) : (
              <ul className="grid w-full snap-x snap-mandatory auto-cols-[296px] grid-flow-col gap-6 overflow-x-auto p-2 pb-8">
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
        <section>
          <div className="mx-auto flex w-250 flex-col gap-4">
            <h2 className="flex items-end gap-2 text-2xl font-bold before:block before:h-10 before:w-11 before:bg-[url('/icon-dishes.svg')] before:bg-contain before:bg-no-repeat before:content-['']">
              ユーザーが投稿した料理たち
            </h2>
            {works.length === 0 ? (
              <p className="text-zinc-700">まだレシピが登録されていません。</p>
            ) : (
              // 3 列レイアウト (左:2 / 中央:3 / 右:2 = 計 7 件)。
              // 自動分配 (columns-3) だと中央 3 件を保証できないため、列を明示的に作る。
              // データが 7 件未満の場合は順に詰めるだけ。
              <div className="grid grid-cols-3 gap-6 p-2 pb-8">
                {[
                  works.slice(0, 2), // 左列 2 件
                  works.slice(2, 5), // 中央列 3 件
                  works.slice(5, 7), // 右列 2 件
                ].map((column, columnIndex) => (
                  <ul key={columnIndex} className="flex flex-col gap-6">
                    {column.map((menu) => (
                      <li key={menu.recipe_id}>
                        <Link
                          href={`/recipes/${menu.recipe_id}`}
                          className="block drop-shadow-lg"
                        >
                          {menu.image_path && (
                            <div className="overflow-hidden rounded-t-xl bg-white">
                              <Image
                                src={menu.image_path}
                                alt={menu.name}
                                width={296}
                                height={200}
                                className="h-auto w-full object-cover"
                              />
                            </div>
                          )}
                          <span className="block rounded-b-xl bg-white p-4">
                            {menu.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
