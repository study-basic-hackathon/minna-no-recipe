"use client";

import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import type { SearchResult } from "@/app/api/search/route";

/**
 * 料理写真をアップロードして類似レシピを検索するコンポーネント。
 *
 * 表示は半透明カード + 点線枠で、背景画像の上にそのまま重ねられる。
 * 背景画像の配置はこのコンポーネントの責務外で、ページ側で行う。
 *
 * 検索結果の表示・遷移はこのコンポーネント内では行わず、`onResult` で親に渡す。
 * 親側でルーティング (router.push) や別コンポーネントへの受け渡しを行う想定。
 */
type Props = {
  onResult: (result: SearchResult) => void;
};

export function RecipeImageUpload({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ドラッグ中だけ枠の色を濃くするための表示用フラグ
  const [isDragOver, setIsDragOver] = useState(false);
  // 隠した <input type="file"> をクリックで開くための ref
  const inputRef = useRef<HTMLInputElement>(null);

  // ファイル選択 (クリック / ドロップ 両方からここに集約)
  function selectFile(f: File | null) {
    setError(null);
    if (f && !f.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }
    setFile(f);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    selectFile(e.dataTransfer.files?.[0] ?? null);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    // preventDefault しないとブラウザ既定 (画像をタブで開く) が動いてしまう
    e.preventDefault();
    setIsDragOver(true);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    selectFile(e.target.files?.[0] ?? null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;
    setPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    // バックエンドが応答しない時に永遠に pending のまま固まらないよう、
    // 15 秒で強制中断する。CLIP 推論 + アップロードを含めても通常は十分。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = (await res.json()) as SearchResult | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "search failed");
        return;
      }
      onResult(data);
    } catch (err) {
      // タイムアウト由来の AbortError と通常エラーを区別してメッセージを変える
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("通信がタイムアウトしました。もう一度お試しください。");
      } else {
        setError(err instanceof Error ? err.message : "unknown error");
      }
    } finally {
      clearTimeout(timeoutId);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col items-center gap-6"
    >
      {/* ── ドロップゾーン: クリック / D&D の両方でファイル選択 ── */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={`w-full cursor-pointer rounded-lg border-2 border-dashed p-12 text-center backdrop-blur-sm transition-colors ${
          isDragOver
            ? "border-orange-500 bg-white/80"
            : "border-orange-400 bg-white/60"
        }`}
      >
        {/* 実体の input は隠して、上の div クリックで開く形に */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />

        {/* クラウドアップロードアイコン (heroicons 風) */}
        <svg
          className="mx-auto mb-4 h-16 w-16 text-orange-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 00-5.91 5.06A5 5 0 007 18h10a4 4 0 001.13-7.84A6 6 0 0012 3zm-1 12V11.41l-1.79 1.8-1.42-1.42L12 7.59l4.21 4.2-1.42 1.42L13 11.41V15h-2z" />
        </svg>

        <p className="text-lg font-bold text-orange-500">
          料理写真をアップロードしてレシピを検索
        </p>
        <p className="mt-2 text-sm text-zinc-700">
          {file ? file.name : "ドラッグ&ドロップまたはクリックして選択"}
        </p>
      </div>

      {/* ── 検索ボタン (ドロップゾーンの外) ── */}
      <button
        type="submit"
        disabled={!file || pending}
        className="rounded-full bg-orange-500 px-12 py-3 text-lg font-bold text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "検索中..." : "検索する"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </form>
  );
}
