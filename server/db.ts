import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if we're using Neon (contains neon.tech) or local PostgreSQL
const isNeon = process.env.DATABASE_URL.includes('neon.tech');

let pool: NeonPool | PgPool;
let db: any; // Use any to handle both drizzle types

if (isNeon) {
  // Use Neon serverless driver for production (Replit)
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  pool = neonPool;
  db = drizzleNeon({ client: neonPool, schema });
  console.log("📊 Using Neon serverless database");
} else {
  // Use standard pg driver for local Docker PostgreSQL
  const pgPool = new PgPool({ connectionString: process.env.DATABASE_URL });
  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
  console.log("📊 Using local PostgreSQL database");
}

export { pool, db };
