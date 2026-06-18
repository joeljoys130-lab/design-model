// src/pages/api/request-otp.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateOTP } from '@/lib/otp-store';
import { sendOtpEmail } from '@/lib/auth/email';
import { findUserByEmail } from '@/lib/auth/users';

/**
 * POST /api/request-otp
 * Generates a 6-digit OTP, saves it to MongoDB, and sends it via SMTP.
 * Only registered users can receive an OTP.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  // Only send OTPs to registered users
  const user = findUserByEmail(email);
  if (!user) {
    // Return 200 (not 404) to avoid email enumeration
    return res.status(200).json({ success: true, message: 'If this email is registered, an OTP will be sent.' });
  }

  try {
    const otp = await generateOTP(email);

    await sendOtpEmail(email, otp);
    console.log(`✅ OTP sent to ${email}`);
    return res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    console.error('❌ Failed to send OTP:', (err as Error).message);
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again.',
    });
  }
}
