import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handlerReadiness } from './api/readiness.js';
import { middlewareLogResponses, middlewareMetricsInc, } from './api/middleware.js';
import { handleReset } from './admin/reset.js';
import { handleFileServerHits } from './admin/metrics.js';
const app = express();
const PORT = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticDir = path.join(__dirname, 'app');
console.log(staticDir);
// global middleware
app.use(middlewareLogResponses);
// increment metrics before serving files
app.use('/app', middlewareMetricsInc);
app.use('/app', express.static(staticDir));
// routes
app.get('/admin/metrics', handleFileServerHits);
app.post('/admin/reset', handleReset);
app.get('/api/healthz', handlerReadiness);
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
