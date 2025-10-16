import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from './config.js';
const migrationClient = postgres(config.db.url, { max: 1 });
console.log('migrationsFolder:', config.db.migrationConfig.migrationsFolder);
await migrate(drizzle(migrationClient), config.db.migrationConfig);
import { handlerReadiness } from './api/readiness.js';
import { middlewareLogResponses, middlewareMetricsInc, } from './api/middleware.js';
import { handleReset } from './admin/reset.js';
import { handleFileServerHits } from './admin/metrics.js';
import { handlerCreateChirp, handlerGetChirps, handlerGetChirp, handlerDeleteChirp, } from './api/chirps.js';
import { errorMiddleware } from './api/error.js';
import { handlerCreateUser, handleValidateLogin, handleUpdateUser, handleUpgradeUser, } from './api/users.js';
import { refreshAccessToken, revokeRefreshToken, } from './admin/auth.js';
const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, 'app');
console.log(staticDir);
// global middleware
app.use(middlewareLogResponses);
app.use(express.json());
// increment metrics before serving files
app.use('/app', middlewareMetricsInc);
app.use('/app', express.static(staticDir));
// routes
app.get('/admin/metrics', handleFileServerHits);
app.post('/admin/reset', handleReset);
app.post('/api/users', handlerCreateUser);
app.post('/api/login', handleValidateLogin);
app.post('/api/chirps', handlerCreateChirp);
app.get('/api/healthz', handlerReadiness);
app.get('/api/chirps', handlerGetChirps);
app.get('/api/chirps/:chirpID', handlerGetChirp);
app.post('/api/refresh', refreshAccessToken);
app.post('/api/revoke', revokeRefreshToken);
app.put('/api/users', handleUpdateUser);
app.delete('/api/chirps/:chirpID', handlerDeleteChirp);
app.post('/api/polka/webhooks', handleUpgradeUser);
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
