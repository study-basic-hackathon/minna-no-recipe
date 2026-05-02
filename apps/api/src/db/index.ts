import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set in .env");
}

const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
