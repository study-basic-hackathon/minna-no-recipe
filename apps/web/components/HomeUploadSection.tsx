"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecipeImageUpload } from "./RecipeImageUpload";

/**
 * トップページ用の画像アップロード + 検索エントリーポイント。
 *
 * page.tsx (Server Component) から関数 prop を Client Component (RecipeImageUpload) に
 * 直接渡せないため、ここで client 境界を挟んでルーティングを担当する。
 *
 * 検索成功時は推測カテゴリを query に乗せて /recipes に遷移する。
 * (該当なし = 閾値以上のマッチがない場合) はその場で案内文を表示。
 */
export function HomeUploadSection() {
  const router = useRouter();
  const [noMatch, setNoMatch] = useState(false);

  return (
    <>
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
      {noMatch && (
        <p className="mt-4 text-zinc-700">
          似たレシピが見つかりませんでした。
        </p>
      )}
    </>
  );
}
