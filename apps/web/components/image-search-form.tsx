"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { SearchResult } from "@/app/api/search/route";

/**
 * 画像をアップロードして類似レシピを検索するフォーム (UI のみ)。
 *
 * - 結果の表示はこのコンポーネント内では行わず、`onResult` で親に渡す。
 *   親側でルーティング (router.push) や別コンポーネントへの受け渡しを行う想定。
 * - リクエスト先は同一オリジンの Next.js Route Handler (`/api/search`) で、
 *   そこから Hono バックエンドにプロキシされる (BFF パターン)。
 */
type Props = {
  onResult: (result: SearchResult) => void;
};

export function ImageSearchForm({ onResult }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    // <input type="file" name="file"> を multipart form として送る
    const formData = new FormData(e.currentTarget);

    try {
      // 同一オリジンの Next.js Route Handler に POST
      // (Route Handler 側で Hono の /api/search にプロキシされる)
      const res = await fetch("/api/search", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as SearchResult | { error: string };

      // HTTP エラー or サーバが {error: "..."} を返した場合
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "search failed");
        return;
      }

      // 成功したら親にデータを渡す。表示やページ遷移は親が判断する
      onResult(data);
    } catch (err) {
      // ネットワークエラー、JSON パース失敗など
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="search-image" className="block text-sm font-medium">
          検索する画像を選択
        </label>
        <input
          id="search-image"
          type="file"
          name="file"
          accept="image/*"
          required
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "検索中..." : "検索する"}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
