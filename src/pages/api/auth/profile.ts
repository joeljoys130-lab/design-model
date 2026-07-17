// src/pages/api/auth/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { OtpService } from '@/lib/auth/otp.service';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

interface PhoneUpdateState {
  userId: string;
  oldPhoneVerified: boolean;
  newPhoneNumber?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Authenticate user via JWT in HttpOnly cookie
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const decoded = verifyAccessToken(token) as { id: string; email: string; name: string } | null;
  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Handle GET - Return profile details
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isPhoneVerified: user.isPhoneVerified,
        preferredOtpMethod: user.preferredOtpMethod,
      },
    });
  }

  // Handle POST/PUT - Update profile or trigger phone update steps
  if (req.method === 'POST') {
    const { action } = req.body as { action?: string };

    // --- Action: Update preferred OTP method ---
    if (action === 'update-preferred-otp') {
      const { method } = req.body as { method?: 'email' | 'phone' };
      if (!method || (method !== 'email' && method !== 'phone')) {
        return res.status(400).json({ success: false, error: 'Invalid OTP method.' });
      }

      if (method === 'phone' && !user.isPhoneVerified) {
        return res.status(400).json({ success: false, error: 'Please verify your phone number first.' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { preferredOtpMethod: method },
      });

      await prisma.auditLog.create({
        data: {
          username: user.email,
          action: 'PREFERRED_OTP_METHOD_UPDATED',
          entity: 'User',
          entityId: user.id,
          details: `Preferred OTP method set to ${method}`,
          userId: user.id,
        },
      });

      return res.status(200).json({ success: true, preferredOtpMethod: method });
    }

    // --- Action: Initiate update phone number (Send OTP to OLD phone) ---
    if (action === 'phone-update-initiate') {
      const { newPhoneNumber } = req.body as { newPhoneNumber?: string };
      if (!newPhoneNumber) {
        return res.status(400).json({ success: false, error: 'New phone number is required.' });
      }

      // Check unique constraint for new phone number
      const phoneExists = await prisma.user.findFirst({
        where: { phoneNumber: newPhoneNumber, NOT: { id: user.id } },
      });
      if (phoneExists) {
        return res.status(400).json({ success: false, error: 'Phone number already in use.' });
      }

      // If user has a verified phone number, we MUST verify the old phone first
      if (user.phoneNumber && user.isPhoneVerified) {
        const otpRes = await OtpService.requestOtp({
          userId: user.id,
          email: user.email,
          channel: 'phone',
          destination: user.phoneNumber,
          ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        });

        if (!otpRes.success) {
          return res.status(400).json({ success: false, error: otpRes.error });
        }

        const stateToken = jwt.sign(
          { userId: user.id, oldPhoneVerified: false, newPhoneNumber } as PhoneUpdateState,
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        return res.status(200).json({
          success: true,
          step: 'verify-old',
          message: 'OTP sent to your current phone number to verify identity.',
          stateToken,
        });
      } else {
        // No existing verified phone, skip directly to verifying new phone
        const otpRes = await OtpService.requestOtp({
          userId: `phoneupdate-${user.id}`,
          email: user.email,
          channel: 'phone',
          destination: newPhoneNumber,
          ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        });

        if (!otpRes.success) {
          return res.status(400).json({ success: false, error: otpRes.error });
        }

        const stateToken = jwt.sign(
          { userId: user.id, oldPhoneVerified: true, newPhoneNumber } as PhoneUpdateState,
          JWT_SECRET,
          { expiresIn: '15m' }
        );

        return res.status(200).json({
          success: true,
          step: 'verify-new',
          message: 'OTP sent to your new phone number.',
          stateToken,
        });
      }
    }

    // --- Action: Verify OTP on OLD phone ---
    if (action === 'phone-update-verify-old') {
      const { otp, stateToken } = req.body as { otp?: string; stateToken?: string };
      if (!otp || !stateToken) {
        return res.status(400).json({ success: false, error: 'OTP and state token are required.' });
      }

      let state: PhoneUpdateState;
      try {
        state = jwt.verify(stateToken, JWT_SECRET) as PhoneUpdateState;
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid or expired update session.' });
      }

      if (state.userId !== user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized update session.' });
      }

      // Verify OTP on old phone number
      const verifyRes = await OtpService.verifyOtp({
        userId: user.id,
        channel: 'phone',
        otp,
        email: user.email,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, error: verifyRes.error });
      }

      // Send OTP to NEW phone number
      if (!state.newPhoneNumber) {
        return res.status(400).json({ success: false, error: 'New phone number missing in session.' });
      }

      const otpRes = await OtpService.requestOtp({
        userId: `phoneupdate-${user.id}`,
        email: user.email,
        channel: 'phone',
        destination: state.newPhoneNumber,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!otpRes.success) {
        return res.status(400).json({ success: false, error: otpRes.error });
      }

      const newStateToken = jwt.sign(
        { userId: user.id, oldPhoneVerified: true, newPhoneNumber: state.newPhoneNumber } as PhoneUpdateState,
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.status(200).json({
        success: true,
        step: 'verify-new',
        message: 'Current phone verified. OTP sent to your new phone number.',
        stateToken: newStateToken,
      });
    }

    // --- Action: Verify OTP on NEW phone and SAVE ---
    if (action === 'phone-update-verify-new') {
      const { otp, stateToken } = req.body as { otp?: string; stateToken?: string };
      if (!otp || !stateToken) {
        return res.status(400).json({ success: false, error: 'OTP and state token are required.' });
      }

      let state: PhoneUpdateState;
      try {
        state = jwt.verify(stateToken, JWT_SECRET) as PhoneUpdateState;
      } catch {
        return res.status(400).json({ success: false, error: 'Invalid or expired update session.' });
      }

      if (state.userId !== user.id || !state.oldPhoneVerified || !state.newPhoneNumber) {
        return res.status(403).json({ success: false, error: 'Invalid or unverified update sequence.' });
      }

      // Verify OTP on new phone number
      const verifyRes = await OtpService.verifyOtp({
        userId: `phoneupdate-${user.id}`,
        channel: 'phone',
        otp,
        email: user.email,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
      });

      if (!verifyRes.success) {
        return res.status(400).json({ success: false, error: verifyRes.error });
      }

      // Check unique constraint one last time
      const phoneExists = await prisma.user.findFirst({
        where: { phoneNumber: state.newPhoneNumber, NOT: { id: user.id } },
      });
      if (phoneExists) {
        return res.status(400).json({ success: false, error: 'Phone number already in use.' });
      }

      // Save new phone number and set isPhoneVerified = true
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneNumber: state.newPhoneNumber,
          isPhoneVerified: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          username: user.email,
          action: 'PHONE_NUMBER_UPDATED',
          entity: 'User',
          entityId: user.id,
          details: `Phone updated to ${state.newPhoneNumber}. Session invalidated.`,
          userId: user.id,
        },
      });

      // Clear the cookie to invalidate active sessions and require fresh login
      res.setHeader(
        'Set-Cookie',
        'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict',
      );

      return res.status(200).json({
        success: true,
        message: 'Phone number updated successfully. You have been logged out, please log in again.',
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
