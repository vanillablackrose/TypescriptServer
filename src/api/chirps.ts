import type { Request, Response, NextFunction, json } from 'express';
import {
  UnauthorizedError,
  ValidationError,
  PermissionError,
  NotFoundError,
} from './error.js';
import {
  createChirp,
  getChirps,
  getChirp,
  deleteChirp,
} from '../db/queries/chirps.js';
import { scrubProfanity } from './profanity.js';
import { getBearerToken, validateJWT } from '../admin/auth.js';
import { config } from '../config.js';

export async function handlerCreateChirp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { body } = req.body;
    if (body.length > 140) {
      throw new ValidationError(
        'Chirp is too long. Max length is 140'
      );
    } else {
      let userId = '';
      if (typeof body !== 'string') {
        throw new ValidationError('Invalid chirp payload');
      }
      // validate token
      const token = await getBearerToken(req);
      if (!token) {
        throw new UnauthorizedError('User not logged in.');
      } else {
        userId = await validateJWT(token, config.secret);
        if (!userId) {
          throw new UnauthorizedError('User not logged in.');
        }
      }

      const cleanedBody = scrubProfanity(body);
      const chirp = await createChirp({
        body: cleanedBody,
        userId: `${userId}`,
      });
      if (chirp) {
        res.status(201).json({
          id: chirp.id,
          createdAt: chirp.createdAt,
          updatedAt: chirp.updatedAt,
          body: chirp.body,
          userId: chirp.userId,
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function handlerGetChirps(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let authorId = '';
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === 'string') {
      authorId = authorIdQuery;
    }

    let sort = 'asc';
    let sortQuery = req.query.sort;
    if (typeof sortQuery === 'string') {
      sort = sortQuery.toLowerCase();

      if (sort !== 'asc' && sort !== 'desc') {
        throw new ValidationError('Malformed request');
      }
    }

    const chirps = await getChirps(authorId, sort);
    if (chirps) {
      let response = [];
      for (let chirp of chirps) {
        response.push({
          id: chirp.id,
          createdAt: chirp.createdAt,
          updatedAt: chirp.updatedAt,
          body: chirp.body,
          userId: chirp.userId,
        });
      }

      res.status(200).send(response);
    }
  } catch (error) {
    next(error);
  }
}

export async function handlerGetChirp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let chirpId = req.params.chirpID;

    if (!chirpId) {
      throw new ValidationError(
        'No Chirp Id Provided to the Get request.'
      );
    }

    const chirp = await getChirp(chirpId);
    if (chirp) {
      res.status(200).json({
        id: chirp.id,
        createdAt: chirp.createdAt,
        updatedAt: chirp.updatedAt,
        body: chirp.body,
        userId: chirp.userId,
      });
    } else {
      throw new NotFoundError('Chirp not found.');
    }
  } catch (error) {
    next(error);
  }
}

export async function handlerDeleteChirp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let accessToken = getBearerToken(req);

    const userId = await validateJWT(accessToken, config.secret);
    if (!userId) {
      throw new UnauthorizedError('User not logged in.');
    }

    let chirpId = req.params.chirpID;

    if (!chirpId) {
      throw new ValidationError(
        'No Chirp Id Provided to the Delete request.'
      );
    }

    //get the chirp
    const chirp = await getChirp(chirpId);
    if (!chirp) {
      throw new NotFoundError('Chirp not found.');
    }
    if (chirp.userId !== userId) {
      throw new PermissionError(
        'Cannot delete that chirp as the user is not the author.'
      );
    } else {
      const result = await deleteChirp(chirpId, userId);
      if (result) {
        res.status(204).send();
      } else {
        throw new Error('Chirp failed to delete');
      }
    }
  } catch (error) {
    next(error);
  }
}
