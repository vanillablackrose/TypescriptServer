import { config } from '../config.js';
export async function middlewareLogResponses(req, res, next) {
    res.on('finish', () => {
        let statusCode = res.statusCode;
        // not OK
        if (statusCode !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
export async function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
