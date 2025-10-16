import { loadEnvFile } from 'node:process';
import path from 'node:path';
const migrationsFolder = path.resolve(process.cwd(), 'src/db/migrations');
loadEnvFile();
const env = envOrThrow('DB_URL');
const secretKey = envOrThrow('SECRET');
const polkaKey = envOrThrow('POLKA_KEY');
export const config = {
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
export function envOrThrow(key) {
    const envVar = process.env[key];
    if (!envVar) {
        throw new Error('Environment not initialized properly.');
    }
    else {
        return envVar;
    }
}
