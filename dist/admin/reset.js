import { apiConfig } from '../config.js';
export function handleReset(req, res) {
    apiConfig.fileserverHits = 0;
    res.status(200).send('OK');
}
