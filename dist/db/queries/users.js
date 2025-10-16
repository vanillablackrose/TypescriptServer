import { db } from '../index.js';
import { users } from '../schema.js';
import { firstOrUndefined } from './utils.js';
import { eq } from 'drizzle-orm';
export async function createUser(user) {
    const result = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();
    return firstOrUndefined(result);
}
export async function deleteUsers() {
    await db.delete(users);
}
export async function getUserByEmail(email) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return firstOrUndefined(result);
}
export async function updateUser(userId, email, hashedPassword) {
    const result = await db
        .update(users)
        .set({
        email: email,
        hashed_password: hashedPassword,
        updatedAt: new Date(),
    })
        .where(eq(users.id, userId))
        .returning();
    return firstOrUndefined(result);
}
export async function upgradeUserToChirpyRed(userId) {
    const result = await db
        .update(users)
        .set({
        is_chirpy_red: true,
    })
        .where(eq(users.id, userId))
        .returning();
    return firstOrUndefined(result);
}
