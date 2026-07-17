// src/pages/api/verify-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAccessToken } from '@/lib/auth/jwt';
import { findUserByEmail } from '@/lib/auth/users';
import { OtpService } from '@/lib/auth/otp.service';
import prisma from '@/lib/prisma';

/**
 * POST /api/verify-otp
 * Body: { email: string; otp: string; method?: 'email' | 'phone' }
 *
 * Verifies the OTP from MongoDB, then issues a JWT auth_token cookie.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, otp, method } = req.body as { email?: string; otp?: string; method?: 'email' | 'phone' };

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(403).json({ success: false, error: 'User not registered' });
  }

  const selectedMethod = method || (user.preferredOtpMethod as 'email' | 'phone') || 'email';
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  // Verify OTP via the unified OtpService
  const result = await OtpService.verifyOtp({
    userId: user.id,
    channel: selectedMethod,
    otp,
    email: user.email,
    ip,
    userAgent,
  });

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  // Update preferred/last OTP method in User profile
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastOtpMethod: selectedMethod,
      ...(selectedMethod === 'phone' ? { isPhoneVerified: true } : {}),
    },
  });

  // Re-fetch user in case isPhoneVerified or preferredOtpMethod was updated
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  const userData = updatedUser || user;

  // Issue JWT (1 hour expiry)
  const token = generateAccessToken({ id: userData.id, email: userData.email, name: userData.name, role: userData.role });
  const isProd = process.env.NODE_ENV === 'production';

  res.setHeader(
    'Set-Cookie',
    `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProd ? '; Secure' : ''}`,
  );

  return res.status(200).json({
    success: true,
    user: {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      phoneNumber: userData.phoneNumber,
      isPhoneVerified: userData.isPhoneVerified,
      preferredOtpMethod: userData.preferredOtpMethod,
    },
  });
}
