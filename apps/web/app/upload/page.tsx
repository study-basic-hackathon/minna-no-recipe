"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type UploadResult = {
  path: string;
  url: string;
  size: number;
  type: string;
};

export default function UploadPage() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`${API_URL}/api/images`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as
        | UploadResult
        | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "upload failed");
        return;
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">画像アップロード</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
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
          {pending ? "アップロード中..." : "アップロード"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 space-y-2">
          <p className="break-all text-sm text-zinc-600">{result.path}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="uploaded" className="w-full rounded" />
        </div>
      )}
    </main>
  );
}
