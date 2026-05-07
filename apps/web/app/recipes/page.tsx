"use client";

import { useSearchParams } from "next/navigation";

/**
 * 検証用スタブ。
 * 戻るボタンで /temp に戻ったときに RecipeImageUpload が再マウントされて
 * 正常に動作するかを確認するためだけに置く一時ファイル。
 * 別メンバーが本物の /recipes を実装する際にそのまま上書きされる想定。
 *
 * @deprecated 本物の /recipes 実装で差し替える前提のスタブ。
 */
export default function RecipesStub() {
  const params = useSearchParams();
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">recipes stub</h1>
      <p>category: {params.get("category")}</p>
      <p className="text-sm text-zinc-500">
        ブラウザの戻るボタンで /temp に戻り、再度アップロードできるか確認してください。
      </p>
    </main>
  );
}
