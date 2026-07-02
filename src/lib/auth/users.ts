/**
 * src/lib/auth/users.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for registered users.
 * To add a new user, append an entry here.
 * Passwords are plain-text for now — replace with bcrypt hashing when scaling.
 */

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
}

/** All authorised users, keyed by email (lowercase). */
export const REGISTERED_USERS: Record<string, RegisteredUser> = {
  'thomasjosephkidarathil@gmail.com': {
    id: 'u-thomas',
    email: 'thomasjosephkidarathil@gmail.com',
    name: 'Thomas Joseph',
    role: 'ADMIN',
    password: 'Thomas@erp',
  },
  'test@buildcorp.com': {
    id: 'u-test',
    email: 'test@buildcorp.com',
    name: 'Test User',
    role: 'ADMIN',
    password: 'TestPassword',
  },
};

/** Look up a user by email. Returns undefined if not registered. */
export function findUserByEmail(email: string): RegisteredUser | undefined {
  return REGISTERED_USERS[email.toLowerCase()];
}

/** Look up a user by username or email. Returns undefined if not found. */
export function findUser(usernameOrEmail: string): RegisteredUser | undefined {
  // Try by email first
  const byEmail = REGISTERED_USERS[usernameOrEmail.toLowerCase()];
  if (byEmail) return byEmail;

  // Try by matching username prefix (e.g. "thomas" → "thomasjosephkidarathil@gmail.com")
  return Object.values(REGISTERED_USERS).find(
    (u) => u.email.split('@')[0].toLowerCase() === usernameOrEmail.toLowerCase(),
  );
}
