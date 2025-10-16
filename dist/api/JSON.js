import { scrubProfanityFromJSON } from './profanity.js';
import { ValidationError } from './error.js';
export async function handleValidateJSON(req, res, next) {
    let body = ''; // 1. Initialize
    // 2. Listen for data events
    req.on('data', (chunk) => {
        body += chunk;
    });
    // 3. Listen for end events
    req.on('end', () => {
        try {
            const parsedBody = JSON.parse(body);
            const bodyVal = parsedBody.body;
            if (bodyVal.length > 140) {
                throw new ValidationError('Chirp is too long. Max length is 140');
            }
            else {
                const cleanedBody = scrubProfanityFromJSON(parsedBody);
                res.status(200).send(cleanedBody);
            }
        }
        catch (error) {
            next(error);
        }
    });
}
/*
export async function handleEncodeJSON(req: Request, res: Response) {
  type responseData = {
    body: string;
  };

  res.header('Content-Type', 'application/json');
  const body = JSON.stringify(respBody);
  res.status(200).send(body);
}*/
