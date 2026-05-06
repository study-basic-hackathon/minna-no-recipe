"use client";

/**
 * 動作確認用の一時ページ。
 *
 * ImageSearchForm を試すためだけのページで、完成画面ができ次第削除する想定。
 * 検索が成功したら、推論されたカテゴリ名を query に乗せて /recipes に遷移する。
 * (`/recipes` ページは別メンバーが実装中)
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageSearchForm } from "@/components/image-search-form";

export default function TempPage() {
  const router = useRouter();
  // category が null (= 閾値以上のマッチなし) のとき表示するフラグ
  const [noMatch, setNoMatch] = useState(false);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">[一時] 画像検索デモ</h1>
      <p className="mb-6 text-sm text-zinc-500">
        画像をアップロードすると、判定されたカテゴリのレシピ一覧へ遷移します。
      </p>

      <ImageSearchForm
        onResult={(data) => {
          // category があれば一覧ページへ遷移、なければ "見つかりませんでした" 表示
          if (data.category) {
            router.push(
              `/recipes?category=${encodeURIComponent(data.category)}`,
            );
          } else {
            setNoMatch(true);
          }
        }}
      />

      {noMatch && (
        <p className="mt-4 text-zinc-700">似たレシピが見つかりませんでした。</p>
      )}
    </main>
  );
}
