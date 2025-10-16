import { db } from '../index.js';
import { refresh_tokens, users } from '../schema.js';
import { firstOrUndefined } from './utils.js';
import { eq, and, isNull, gt } from 'drizzle-orm';
export async function createRefreshToken(newToken) {
    const result = await db
        .insert(refresh_tokens)
        .values(newToken)
        .onConflictDoNothing()
        .returning();
    return firstOrUndefined(result);
}
export async function userForRefreshToken(token) {
    const [result] = await db
        .select({ user: users })
        .from(users)
        .innerJoin(refresh_tokens, eq(users.id, refresh_tokens.userId))
        .where(and(eq(refresh_tokens.token, token), isNull(refresh_tokens.revokedAt), gt(refresh_tokens.expiresAt, new Date())))
        .limit(1);
    return result;
}
export function validateRefreshToken(refreshToken) {
    let result = 'valid';
    //will be null if not revoked, otherwise will be a date
    if (refreshToken.revokedAt) {
        result = 'ERROR' + String.fromCharCode(4) + 'revoked';
    }
    let currDate = new Date();
    //validate the token here for expiration
    if (
    //should be a negative number if the current date is after the
    //expiration date
    Math.floor(refreshToken.expiresAt.getMilliseconds() -
        currDate.getMilliseconds()) < 0) {
        result = 'ERROR' + String.fromCharCode(4) + 'expired';
    }
    return result;
}
export async function setRevokedAtDate(refreshToken) {
    return db
        .update(refresh_tokens)
        .set({ revokedAt: new Date() })
        .where(eq(refresh_tokens.token, refreshToken))
        .returning();
}
export async function deleteRefreshTokens() {
    await db.delete(refresh_tokens);
}
