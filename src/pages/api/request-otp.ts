// src/pages/api/request-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail } from '@/lib/auth/users';
import { OtpService } from '@/lib/auth/otp.service';

/**
 * POST /api/request-otp
 * Generates a 6-digit OTP, saves it to MongoDB, and sends it via Email or SMS.
 * Accept body: { email: string, method?: 'email' | 'phone' }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email, method } = req.body as { email?: string; method?: 'email' | 'phone' };
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    // Return 200 to avoid email enumeration
    return res.status(200).json({ success: true, message: 'If registered, an OTP will be sent.' });
  }

  const selectedMethod = method || (user.preferredOtpMethod as 'email' | 'phone') || 'email';

  let destination = '';
  if (selectedMethod === 'email') {
    destination = user.email;
  } else if (selectedMethod === 'phone') {
    if (!user.phoneNumber) {
      return res.status(400).json({ success: false, error: 'No phone number registered for this user.' });
    }
    destination = user.phoneNumber;
  } else {
    return res.status(400).json({ success: false, error: 'Invalid OTP delivery method.' });
  }

  // Get IP and user agent for security auditing
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  try {
    const result = await OtpService.requestOtp({
      userId: user.id,
      email: user.email,
      channel: selectedMethod,
      destination,
      ip,
      userAgent,
    });

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent to your registered ${selectedMethod === 'email' ? 'email' : 'mobile number'}.`,
    });
  } catch (err) {
    console.error('❌ Failed to request OTP:', (err as Error).message);
    return res.status(500).json({
      success: false,
      error: 'Failed to request OTP. Please try again.',
    });
  }
}
