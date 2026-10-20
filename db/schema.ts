import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
// A profile belongs to an account. Saves and checklist rows use that same user ID.
export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  studentType: text('student_type').notNull().default('incoming'),
});
export const saves = sqliteTable(
  'saves',
  {
    userId: text('user_id').notNull(),
    itemId: text('item_id').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.itemId] })],
);
export const checklist = sqliteTable(
  'checklist',
  {
    userId: text('user_id').notNull(),
    step: text('step').notNull(),
    complete: integer('complete', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.step] })],
);

// Community content and reports.
export const questions = sqliteTable(
  'questions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    author: text('author').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    category: text('category').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('questions_user_time').on(t.userId, t.createdAt)],
);
export const replies = sqliteTable(
  'replies',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id').notNull(),
    userId: text('user_id').notNull(),
    author: text('author').notNull(),
    body: text('body').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [
    index('replies_question').on(t.questionId),
    index('replies_user_time').on(t.userId, t.createdAt),
  ],
);
export const reports = sqliteTable(
  'reports',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    reason: text('reason').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('reports_user_time').on(t.userId, t.createdAt)],
);

// Authentication records are separate from public profile information.
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    tokenHash: text('token_hash').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => [
    index('sessions_user').on(table.userId),
    index('sessions_expiry').on(table.expiresAt),
  ],
);

export const authRateLimits = sqliteTable(
  'auth_rate_limits',
  {
    key: text('key').primaryKey(),
    attempts: integer('attempts').notNull().default(1),
    expiresAt: integer('expires_at').notNull(),
  },
  (table) => [index('auth_limits_expiry').on(table.expiresAt)],
);
