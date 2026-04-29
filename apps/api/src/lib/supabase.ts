import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env",
  );
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = process.env.SUPABASE_BUCKET ?? "images";
