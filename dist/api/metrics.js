import { config } from '../config.js';
export async function handleFileServerHits(req, res) {
  res.status(200).type('text/html; charset=utf-8').send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html> `);
}
