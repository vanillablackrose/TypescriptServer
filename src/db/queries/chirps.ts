import { db } from '../index.js';
import { chirps, Chirp } from '../schema.js';
import { firstOrUndefined } from './utils.js';
import { sql, eq, and } from 'drizzle-orm';

export async function createChirp(chirp: Chirp) {
  const result = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return firstOrUndefined(result);
}

export async function deleteChirps() {
  await db.delete(chirps);
}

export async function getChirps(authorId: string, sort: string) {
  return await db
    .select()
    .from(chirps)
    .where(authorId !== '' ? eq(chirps.userId, authorId) : undefined)
    .orderBy(
      sort === 'asc'
        ? sql`${chirps.createdAt} asc nulls first`
        : sql`${chirps.createdAt} desc nulls first`
    );
}

export async function getChirp(chirpId: string) {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, chirpId));
  return firstOrUndefined(result);
}

export async function deleteChirp(chirpId: string, userId: string) {
  return await db
    .delete(chirps)
    .where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId)))
    .returning();
}
