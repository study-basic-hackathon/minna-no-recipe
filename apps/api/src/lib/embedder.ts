import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  RawImage,
} from "@huggingface/transformers";
import sharp from "sharp";

const MODEL_ID = "Xenova/clip-vit-base-patch32";
export const EMBEDDING_DIM = 512;

let processor: Awaited<
  ReturnType<typeof AutoProcessor.from_pretrained>
> | null = null;
let visionModel: CLIPVisionModelWithProjection | null = null;

export async function initEmbedder(): Promise<void> {
  if (processor && visionModel) return;

  console.log(`[embedder] Loading model: ${MODEL_ID}...`);

  [processor, visionModel] = await Promise.all([
    AutoProcessor.from_pretrained(MODEL_ID),
    CLIPVisionModelWithProjection.from_pretrained(MODEL_ID),
  ]);

  console.log("[embedder] Model loaded.");
}

function normalize(tensor: { data: Float32Array; dims: number[] }): number[] {
  const data = tensor.data;
  const dim = tensor.dims[1];

  let norm = 0;
  for (let d = 0; d < dim; d++) {
    norm += data[d] * data[d];
  }
  norm = Math.sqrt(norm);

  if (norm < 1e-12) {
    return new Array<number>(dim).fill(0);
  }

  const result = new Array<number>(dim);
  for (let d = 0; d < dim; d++) {
    result[d] = data[d] / norm;
  }

  return result;
}

async function bufferToRawImage(buf: Buffer): Promise<RawImage> {
  const { data, info } = await sharp(buf)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return new RawImage(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    info.channels,
  );
}

async function urlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function embedImage(input: Buffer | string): Promise<number[]> {
  if (!processor || !visionModel) {
    throw new Error("Embedder not initialized. Call initEmbedder() first.");
  }

  const buffer = typeof input === "string" ? await urlToBuffer(input) : input;
  const image = await bufferToRawImage(buffer);

  const processed = await processor(image);
  const { image_embeds } = await visionModel(processed);

  return normalize(image_embeds);
}
