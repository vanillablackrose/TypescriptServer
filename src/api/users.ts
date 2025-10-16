import type { Request, Response, NextFunction, json } from 'express';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  PermissionError,
} from './error.js';
import {
  createUser,
  getUserByEmail,
  updateUser,
  upgradeUserToChirpyRed,
} from '../db/queries/users.js';
import {
  checkPasswordHash,
  hashPassword,
  makeJWT,
  makeRefreshToken,
  getBearerToken,
  validateJWT,
  getAPIKey,
} from '../admin/auth.js';
import { config } from '../config.js';
import { userForRefreshToken } from '../db/queries/tokens.js';

export async function handlerCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    if (!email) {
      throw new ValidationError('Expected an email to create a user');
    } else if (!password) {
      throw new ValidationError(
        'Expected a password to create a user'
      );
    } else {
      const hashedPassword = await hashPassword(password);
      const user = await createUser({
        email: email,
        hashed_password: hashedPassword,
      });
      if (user) {
        res.status(201).json({
          id: user.id,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          email: user.email,
          isChirpyRed: user.is_chirpy_red,
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function handleValidateLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user || !user.hashed_password) {
      throw new UnauthorizedError('Incorrect email or password');
    } else {
      const expiresInSeconds = 60;

      const bValid = await checkPasswordHash(
        password,
        user.hashed_password
      );
      if (!bValid) {
        throw new UnauthorizedError('Incorrect email or password');
      } else {
        //create a JWT token
        const token = await makeJWT(
          user.id,
          expiresInSeconds,
          config.secret
        );
        if (token) {
          // create a refresh token
          const refreshToken = await makeRefreshToken(user.id);
          if (refreshToken) {
            res.status(200).json({
              id: user.id,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
              email: user.email,
              token: token,
              refreshToken: refreshToken,
              isChirpyRed: user.is_chirpy_red,
            });
          }
        } else {
          throw new Error('Error creating token');
        }
      }
    }
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    let accessToken = getBearerToken(req);

    const userId = await validateJWT(accessToken, config.secret);
    if (!userId) {
      throw new UnauthorizedError('User not logged in.');
    }

    const hashedPassword = await hashPassword(password);

    const updatedUser = await updateUser(
      userId,
      email,
      hashedPassword
    );

    if (updatedUser) {
      res.status(200).json({
        id: updatedUser.id,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        email: updatedUser.email,
        isChirpyRed: updatedUser.is_chirpy_red,
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function handleUpgradeUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = getAPIKey(req);

    if (apiKey != config.polkaKey) {
      throw new PermissionError(
        'You do not have permission to upgrade'
      );
    }

    const event = req.body.event;

    if (!event) {
      throw new ValidationError('Malformed request');
    } else if (event !== 'user.upgraded') {
      res.status(204).send();
    } else {
      const userId = req.body.data.userId;
      if (!userId) {
        throw new ValidationError('Malformed request');
      } else {
        const user = await upgradeUserToChirpyRed(userId);
        if (user) {
          res.status(204).send();
        } else {
          throw new NotFoundError('User not found');
        }
      }
    }
  } catch (error) {
    next(error);
  }
}
