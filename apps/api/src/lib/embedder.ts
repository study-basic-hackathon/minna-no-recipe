import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
} from "@huggingface/transformers";
import sharp from "sharp";

// 使用する CLIP モデル (画像 → 512 次元ベクトル)
// Xenova/* は transformers.js (Node/ブラウザ) 用の ONNX 形式モデル
const MODEL_ID = "Xenova/clip-vit-base-patch32";
export const EMBEDDING_DIM = 512;

// プロセス内でモデルをキャッシュ。最初の呼び出しでロードし、以降は再利用
let processor: Awaited<
  ReturnType<typeof AutoProcessor.from_pretrained>
> | null = null;
let visionModel: CLIPVisionModelWithProjection | null = null;

/**
 * モデルを初期化する。サーバ起動時に一度だけ呼び出す想定。
 * 初回はモデルファイル (~150MB) をダウンロードするので時間がかかる。
 * 2 回目以降は HuggingFace のローカルキャッシュからロードされる。
 */
export async function initEmbedder(): Promise<void> {
  if (processor && visionModel) return;

  console.log(`[embedder] Loading model: ${MODEL_ID}...`);

  [processor, visionModel] = await Promise.all([
    AutoProcessor.from_pretrained(MODEL_ID),
    CLIPVisionModelWithProjection.from_pretrained(MODEL_ID),
  ]);

  console.log("[embedder] Model loaded.");
}

/**
 * ベクトルを L2 正規化する (長さを 1 にする)。
 * 正規化済みのベクトル同士なら、コサイン類似度 = 内積 になり計算が単純になる。
 */
function normalize(tensor: { data: Float32Array; dims: number[] }): number[] {
  const data = tensor.data;
  const dim = tensor.dims[1];

  // ベクトルの長さ (ユークリッドノルム) を計算
  let norm = 0;
  for (let d = 0; d < dim; d++) {
    norm += data[d] * data[d];
  }
  norm = Math.sqrt(norm);

  // ゼロベクトルだった場合のゼロ除算ガード (NaN 防止)
  if (norm < 1e-12) {
    return new Array<number>(dim).fill(0);
  }

  // 各要素を norm で割って単位ベクトル化
  const result = new Array<number>(dim);
  for (let d = 0; d < dim; d++) {
    result[d] = data[d] / norm;
  }

  return result;
}

/**
 * Buffer (画像のバイト列) を transformers.js が扱える RawImage に変換する。
 * sharp で必ず RGB 3 チャネルにデコードして、入力経路を一本化する。
 */
async function bufferToRawImage(buf: Buffer): Promise<RawImage> {
  const { data, info } = await sharp(buf)
    .removeAlpha() // PNG のアルファチャネルがあっても落として 3 チャネルに揃える
    .raw()
    .toBuffer({ resolveWithObject: true });

  return new RawImage(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    info.channels,
  );
}

/**
 * URL から画像を fetch して Buffer にする。
 * RawImage.fromURL を使わず、URL も Buffer も同じ bufferToRawImage 経由にすることで
 * アルファ処理など前処理の差異をなくす。
 */
async function urlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * 画像を埋め込みベクトル (512 次元、L2 正規化済み) に変換する。
 * 入力は Buffer (アップロード画像など) でも URL 文字列でも OK。
 */
export async function embedImage(input: Buffer | string): Promise<number[]> {
  if (!processor || !visionModel) {
    throw new Error("Embedder not initialized. Call initEmbedder() first.");
  }

  // どちらの入力でも最終的に bufferToRawImage を通す
  const buffer = typeof input === "string" ? await urlToBuffer(input) : input;
  const image = await bufferToRawImage(buffer);

  // CLIP の前処理 (リサイズ・正規化・テンソル化) → ビジョンモデル → 埋め込み
  const processed = await processor(image);
  const { image_embeds } = await visionModel(processed);

  return normalize(image_embeds);
}
