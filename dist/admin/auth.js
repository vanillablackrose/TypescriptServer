import * as argon2 from 'argon2';
import { ValidationError, UnauthorizedError } from '../api/error.js';
import jwt from 'jsonwebtoken';
import * as crypto from 'node:crypto';
import { createRefreshToken, userForRefreshToken, setRevokedAtDate, } from '../db/queries/tokens.js';
import { config } from '../config.js';
export function hashPassword(password) {
    return argon2.hash(password);
}
export function checkPasswordHash(password, hash) {
    try {
        return argon2.verify(hash, password);
    }
    catch (err) {
        throw new ValidationError('Something went wrong in the check password validation.');
    }
}
export function makeJWT(userID, expiresIn, secret) {
    let issuedAt = Math.floor(Date.now() / 1000);
    let payloadObj = {
        iss: 'chirpy',
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: issuedAt + expiresIn,
    };
    return jwt.sign(payloadObj, secret);
}
export function validateJWT(tokenString, secret) {
    try {
        let decoded = jwt.verify(tokenString, secret);
        if (typeof decoded.sub === 'string') {
            return decoded.sub;
        }
        else {
            throw new UnauthorizedError('Token not valid');
        }
    }
    catch (err) {
        throw new UnauthorizedError('Token not valid');
    }
}
export function getBearerToken(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throw new UnauthorizedError('Malformed authorization header');
    }
    return extractBearerToken(authHeader);
}
export function extractBearerToken(header) {
    const splitAuth = header.split(' ');
    if (splitAuth.length < 2 || splitAuth[0] !== 'Bearer') {
        throw new ValidationError('Malformed authorization header');
    }
    return splitAuth[1];
}
export async function makeRefreshToken(userId) {
    try {
        const token = crypto.randomBytes(32).toString('hex');
        let expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 60);
        const refreshToken = await createRefreshToken({
            userId: userId,
            token: token,
            expiresAt: expiresAt,
        });
        if (refreshToken) {
            //return the token string if the creation worked properly
            return refreshToken.token;
        }
        else {
            throw new Error('Error creating token');
        }
    }
    catch (err) {
        throw new Error('Error creating token');
    }
}
export async function refreshAccessToken(req, res) {
    let refreshToken = getBearerToken(req);
    const result = await userForRefreshToken(refreshToken);
    if (!result) {
        throw new UnauthorizedError('invalid refresh token');
    }
    const user = result.user;
    const accessToken = makeJWT(user.id, 60 * 60, config.secret);
    res.status(200).json({
        token: accessToken,
    });
}
export async function revokeRefreshToken(req, res, next) {
    try {
        const token = getBearerToken(req);
        if (!token) {
            throw new ValidationError('Token missing from request');
        }
        const result = await setRevokedAtDate(token);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
export function getAPIKey(req) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throw new UnauthorizedError('Malformed authorization header');
    }
    return extractAPIKey(authHeader);
}
export function extractAPIKey(header) {
    const splitAuth = header.split(' ');
    if (splitAuth.length < 2 || splitAuth[0] !== 'ApiKey') {
        throw new ValidationError('Malformed authorization header');
    }
    return splitAuth[1];
}
