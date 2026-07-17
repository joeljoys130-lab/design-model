// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { OtpService } from '@/lib/auth/otp.service';
import { generateAccessToken } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';


const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

interface RegisterState {
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
  isEmailVerified: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { step } = req.query as { step?: string };

  try {
    if (step === 'initiate') {
      const { name, email, phoneNumber, password } = req.body as {
        name?: string;
        email?: string;
        phoneNumber?: string;
        password?: string;
      };

      if (!name || !email || !phoneNumber || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
      }

      // Check unique constraints
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailExists) {
        return res.status(400).json({ success: false, error: 'Email already registered.' });
      }

      const phoneExists = await prisma.user.findUnique({
        where: { phoneNumber },
      });
      if (phoneExists) {
        return res.status(400).json({ success: false, error: 'Phone number already registered.' });
      }

      const userId = `pending-${email.toLowerCase()}`;

      // Send Email OTP
      const otpRes = await OtpService.requestOtp({
        userId,
        email: email.toLowerCase(),
        channel: 'email',
        destination: email.toLowerCase(),
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!otpRes.success) {
        return res.status(400).json({ success: false, error: otpRes.error });
      }

      // Sign the registration state
      const stateToken = jwt.sign(
        { name, email: email.toLowerCase(), phoneNumber, password, isEmailVerified: false } as RegisterState,
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        success: true,
        message: 'Email OTP sent.',
        stateToken,
      });
    }

    if (step === 'verify-email') {
      const { otp, stateToken } = req.body as { otp?: string; stateToken?: string };
      if (!otp || !stateToken) {
        return res.status(400).json({ success: false, error: 'OTP and state token are required.' });
      }

      // Verify token
      let state: RegisterState;
      try {
        state = jwt.verify(stateToken, JWT_SECRET) as RegisterState;
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid or expired registration session.' });
      }

      const userId = `pending-${state.email}`;

      // Verify OTP
      const verifyRes = await OtpService.verifyOtp({
        userId,
        channel: 'email',
        otp,
        email: state.email,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, error: verifyRes.error });
      }

      // Request Phone OTP
      const otpRes = await OtpService.requestOtp({
        userId,
        email: state.email,
        channel: 'phone',
        destination: state.phoneNumber,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!otpRes.success) {
        return res.status(400).json({ success: false, error: otpRes.error });
      }

      // Sign updated registration state
      const newStateToken = jwt.sign(
        { ...state, isEmailVerified: true } as RegisterState,
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        success: true,
        message: 'Email verified. Phone OTP sent.',
        stateToken: newStateToken,
      });
    }

    if (step === 'verify-phone') {
      const { otp, stateToken } = req.body as { otp?: string; stateToken?: string };
      if (!otp || !stateToken) {
        return res.status(400).json({ success: false, error: 'OTP and state token are required.' });
      }

      // Verify token
      let state: RegisterState;
      try {
        state = jwt.verify(stateToken, JWT_SECRET) as RegisterState;
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid or expired registration session.' });
      }

      if (!state.isEmailVerified) {
        return res.status(400).json({ success: false, error: 'Email verification is required before phone verification.' });
      }

      const userId = `pending-${state.email}`;

      // Verify Phone OTP
      const verifyRes = await OtpService.verifyOtp({
        userId,
        channel: 'phone',
        otp,
        email: state.email,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, error: verifyRes.error });
      }

      // Re-verify that user does not exist (race condition safety)
      const emailExists = await prisma.user.findUnique({ where: { email: state.email } });
      const phoneExists = await prisma.user.findUnique({ where: { phoneNumber: state.phoneNumber } });

      if (emailExists || phoneExists) {
        return res.status(400).json({ success: false, error: 'User already exists.' });
      }

      // Create the user in the database
      const user = await prisma.user.create({
        data: {
          email: state.email,
          name: state.name,
          password: state.password || 'TemporaryPassword',
          phoneNumber: state.phoneNumber,
          isPhoneVerified: true,
          preferredOtpMethod: 'email',
        },
      });

      // Log success audit
      await prisma.auditLog.create({
        data: {
          username: user.email,
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: user.id,
          details: `User registered successfully. IP: ${req.socket.remoteAddress || 'unknown'}`,
          userId: user.id,
        },
      });

      // Issue JWT session cookie
      const token = generateAccessToken({ id: user.id, email: user.email, name: user.name, role: user.role });
      const isProd = process.env.NODE_ENV === 'production';

      res.setHeader(
        'Set-Cookie',
        `auth_token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict${isProd ? '; Secure' : ''}`,
      );

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phoneNumber: user.phoneNumber,
          isPhoneVerified: user.isPhoneVerified,
          preferredOtpMethod: user.preferredOtpMethod,
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid registration step.' });
  } catch (error) {
    logger.error(`Registration error: ${(error as Error).message}`);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
