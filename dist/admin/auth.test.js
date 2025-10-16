import { describe, it, expect, beforeAll } from 'vitest';
import { makeJWT, validateJWT, hashPassword, checkPasswordHash, } from './auth.js';
describe('Password Hashing', () => {
    const password1 = 'correctPassword123!';
    const password2 = 'anotherPassword456!';
    let hash1;
    let hash2;
    const userID = '1234';
    const secret = 'helloworld';
    const exp = 1500;
    let jwtKey;
    beforeAll(async () => {
        hash1 = await hashPassword(password1);
        hash2 = await hashPassword(password2);
        jwtKey = await makeJWT(userID, exp, secret);
    });
    it('should return true for the correct password', async () => {
        const result = await checkPasswordHash(password1, hash1);
        expect(result).toBe(true);
    });
    it(`should return userID ${userID}  for the correct user ID in the jwt key`, async () => {
        const result = await validateJWT(jwtKey, secret);
        expect(result).toBe(userID);
    });
});
