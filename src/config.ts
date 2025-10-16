import { loadEnvFile } from 'node:process';
import type { MigrationConfig } from 'drizzle-orm/migrator';
import path from 'node:path';

const migrationsFolder = path.resolve(
  process.cwd(),
  'src/db/migrations'
);
loadEnvFile();

type config = {
  fileserverHits: number;
  db: DBConfig;
  secret: string;
  polkaKey: string;
};

type DBConfig = {
  url: string;
  migrationConfig: MigrationConfig;
};

const env = envOrThrow('DB_URL');
const secretKey = envOrThrow('SECRET');
const polkaKey = envOrThrow('POLKA_KEY');

export const config: config = {
  fileserverHits: 0,
  db: {
    url: env,
    migrationConfig: {
      migrationsFolder: migrationsFolder,
    },
  },
  secret: secretKey,
  polkaKey: polkaKey,
};

export function envOrThrow(key: string): string {
  const envVar = process.env[key];
  if (!envVar) {
    throw new Error('Environment not initialized properly.');
  } else {
    return envVar;
  }
}
