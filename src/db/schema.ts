import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar('email', { length: 256 }).unique().notNull(),
  is_chirpy_red: boolean('is_chirpy_red').default(false),
  hashed_password: varchar('hashed_password').default(sql`null`),
});

export type NewUser = typeof users.$inferInsert;

//DO NOT RETURN THE PASSWORD WITH THE OBJECT TYPE FOR RESPONSES
export type UserResponse = Omit<NewUser, 'hashedPassword'>;

export const chirps = pgTable('chirps', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text('body').notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export type Chirp = typeof chirps.$inferInsert;

export const refresh_tokens = pgTable('refresh_tokens', {
  token: text('token').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at').default(sql`null`),
});

export type RefreshToken = typeof refresh_tokens.$inferInsert;
