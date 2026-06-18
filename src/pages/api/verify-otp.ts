// src/pages/api/verify-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyOTP } from '@/lib/otp-store';
import { generateAccessToken } from '@/lib/auth/jwt';
import { findUserByEmail } from '@/lib/auth/users';

/**
 * POST /api/verify-otp
 * Body: { email: string; otp: string }
 *
 * Verifies the OTP from MongoDB, then issues a JWT auth_token cookie.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body as { email?: string; otp?: string };

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  // Verify OTP from MongoDB (async, one-time use)
  const valid = await verifyOTP(email, otp);
  if (!valid) {
    return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
  }

  // Look up the registered user
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(403).json({ success: false, error: 'User not registered' });
  }

  // Issue JWT (1 hour expiry)
  const token = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const isProd = process.env.NODE_ENV === 'production';

  res.setHeader(
    'Set-Cookie',
    `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProd ? '; Secure' : ''}`,
  );

  return res.status(200).json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
