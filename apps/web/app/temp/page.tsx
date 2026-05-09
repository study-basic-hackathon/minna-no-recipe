"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecipeImageUpload } from "@/components/RecipeImageUpload";

/**
 * 動作確認用の一時ページ。
 *
 * RecipeImageUpload を試すためだけのページで、完成画面ができ次第削除する想定。
 * 検索が成功したら、推論されたカテゴリ名を query に乗せて /recipes に遷移する。
 * (`/recipes` ページは別メンバーが実装中)
 *
 * 背景画像の上にコンポーネントを重ねるレイアウトの叩き台でもあり、
 * トップページ側ではここのパターンをそのまま流用できる。
 *
 * @deprecated 完成画面リリース時に削除する一時ページ。新規参照を追加しないこと。
 */
export default function TempPage() {
  const router = useRouter();
  // category が null (= 閾値以上のマッチなし) のとき表示するフラグ
  const [noMatch, setNoMatch] = useState(false);

  return (
    <main>
      {/* ── ヒーローセクション: 背景画像の上にアップロード UI を重ねる ── */}
      {/* 親に position:relative を付けて、子の <Image fill> を絶対配置できるようにする */}
      <section className="relative min-h-[600px] overflow-hidden">
        <Image
          src="/hero-food.avif"
          alt=""
          fill
          priority
          // -z-10 で背景に押し下げて、上に重なる UI のクリックを邪魔しない
          className="-z-10 object-cover"
        />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-8 py-20">
          <RecipeImageUpload
            onResult={(data) => {
              if (data.category) {
                router.push(
                  `/recipes?category=${encodeURIComponent(data.category)}`,
                );
              } else {
                setNoMatch(true);
              }
            }}
          />
        </div>
      </section>

      {noMatch && (
        <p className="mx-auto mt-4 max-w-3xl px-8 text-zinc-700">
          似たレシピが見つかりませんでした。
        </p>
      )}
    </main>
  );
}
