// src/pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { findUserByEmail } from '@/lib/auth/users';
import { OtpService } from '@/lib/auth/otp.service';

/**
 * POST /api/auth/forgot-password
 * Body:
 *   - For requesting OTP: { action: 'request-otp', email: string, method: 'email' | 'phone' }
 *   - For resetting: { action: 'reset-password', email: string, method: 'email' | 'phone', otp: string, newPassword: string }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { action, email, method } = req.body as {
    action?: 'request-otp' | 'reset-password';
    email?: string;
    method?: 'email' | 'phone';
  };

  if (!email || !method || (method !== 'email' && method !== 'phone')) {
    return res.status(400).json({ success: false, error: 'Email and method ("email" | "phone") are required.' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Avoid email enumeration
    return res.status(200).json({ success: true, message: 'If registered, instructions have been sent.' });
  }

  const userId = `forgot-${user.email}`;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    if (action === 'request-otp') {
      const destination = method === 'email' ? user.email : user.phoneNumber;
      if (!destination) {
        return res.status(400).json({ success: false, error: `No registered contact found for ${method}.` });
      }

      const otpRes = await OtpService.requestOtp({
        userId,
        email: user.email,
        channel: method,
        destination,
        ip,
        userAgent,
      });

      if (!otpRes.success) {
        return res.status(400).json({ success: false, error: otpRes.error });
      }

      return res.status(200).json({ success: true, message: `OTP sent to your registered ${method}.` });
    }

    if (action === 'reset-password') {
      const { otp, newPassword } = req.body as { otp?: string; newPassword?: string };
      if (!otp || !newPassword) {
        return res.status(400).json({ success: false, error: 'OTP and new password are required.' });
      }

      const verifyRes = await OtpService.verifyOtp({
        userId,
        channel: method,
        otp,
        email: user.email,
        ip,
        userAgent,
      });

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, error: verifyRes.error });
      }

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newPassword },
      });

      await prisma.auditLog.create({
        data: {
          username: user.email,
          action: 'PASSWORD_RESET',
          entity: 'User',
          entityId: user.id,
          details: `Password reset successfully via ${method} OTP. IP: ${ip}`,
          userId: user.id,
        },
      });

      return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    }

    return res.status(400).json({ success: false, error: 'Invalid action.' });
  } catch (error) {
    console.error('❌ Forgot password error:', (error as Error).message);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
