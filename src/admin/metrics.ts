import type { Request, Response } from 'express';
import { apiConfig } from '../config.js';

export async function handleFileServerHits(
  req: Request,
  res: Response
) {
  res.status(200).type('text/html; charset=utf-8').send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${apiConfig.fileserverHits} times!</p>
  </body>
</html> `);
}
