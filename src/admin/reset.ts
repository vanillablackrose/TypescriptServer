import type { Request, Response } from 'express';
import { apiConfig } from '../config.js';

export function handleReset(req: Request, res: Response) {
  apiConfig.fileserverHits = 0;
  res.status(200).send('OK');
}
