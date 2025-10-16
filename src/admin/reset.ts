import type { Request, Response } from 'express';
import { config } from '../config.js';
import { deleteUsers } from '../db/queries/users.js';
import { deleteChirps } from '../db/queries/chirps.js';
import { deleteRefreshTokens } from '../db/queries/tokens.js';

export async function handleReset(req: Request, res: Response) {
  config.fileserverHits = 0;

  deleteUsers();
  deleteChirps();
  deleteRefreshTokens();

  res.status(200).send('OK');
}
