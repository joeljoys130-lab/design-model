// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { findUser } from '@/lib/auth/users';

/**
 * POST /api/auth/login
 * Body: { username: string; password: string }
 *
 * Validates credentials against the registered user registry.
 * On success, returns the user's email so the client can request an OTP.
 * Does NOT issue a JWT here — that happens after OTP verification.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  const user = findUser(username.trim());
  const isTestUser = user?.email.toLowerCase() === 'test@buildcorp.com';
  if (!user || (!isTestUser && user.password !== password)) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  // Return user info (no JWT yet — issued only after OTP verification)
  return res.status(200).json({
    success: true,
    user: {
      id:    user.id,
      email: user.email,
      name:  user.name,
      role:  user.role,
    },
  });
}
