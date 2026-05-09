"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecipeImageUpload } from "./RecipeImageUpload";

/**
 * トップページ用の画像アップロード + ルーティングエントリーポイント。
 *
 * フロー:
 *  1. 画像アップロード → /api/search で類似カテゴリ取得
 *  2. category が取れたら /recipes?category=... へ遷移
 *  3. 検索ヒットしなかった場合 (category=null) はその場で案内文表示
 *
 * 結果表示は遷移先の /recipes ページ側で担当する。
 *
 * page.tsx (Server Component) から関数 prop を Client Component に直接渡せないため
 * ここで client 境界を挟む。
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
