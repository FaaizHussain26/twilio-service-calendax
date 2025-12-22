import { Pool } from "pg";
import { variables } from "../constants/variables";

export const pgPool = new Pool({
  host: variables.PG_HOST,
  port: variables.PG_PORT ? Number(variables.PG_PORT) : 5432,
  database: variables.PG_DATABASE,
  user: variables.PG_USER,
  password: variables.PG_PASSWORD,
  ssl: variables.PG_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

export async function verifyPgConnection(): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}
