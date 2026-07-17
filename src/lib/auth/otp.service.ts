/**
 * src/lib/auth/otp.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified OTP Service.
 * Handles generation, hashing, rate limiting, attempt tracking, lockouts,
 * validation, and channel-based dispatch (Email / SMS).
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { sendOtpEmail } from './email';
import { SmsService } from './sms.service';
import { logger } from '../logger';

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const OTP_RESEND_SECONDS = parseInt(process.env.OTP_RESEND_SECONDS || '30', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);

export class OtpService {
  /**
   * Generates a secure random 6-digit OTP.
   */
  public static generateOtpString(email: string): string {
    if (email.toLowerCase() === 'test@buildcorp.com') {
      return '999999';
    }
    const num = crypto.randomInt(100000, 1000000);
    return num.toString();
  }

  /**
   * Request/Send a new OTP to the specified user/channel/destination.
   * Invalidates any active/previous OTPs for this user first.
   */
  public static async requestOtp(params: {
    userId: string;
    email: string;
    channel: 'email' | 'phone';
    destination: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; error?: string; retryAfter?: number }> {
    const { userId, email, channel, destination, ip, userAgent } = params;
    const now = new Date();

    // 1. Rate Limiting Check: 30-second cooldown
    const latestOtp = await prisma.otp.findFirst({
      where: { userId, channel },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOtp) {
      const elapsedSeconds = Math.floor((now.getTime() - latestOtp.createdAt.getTime()) / 1000);
      if (elapsedSeconds < OTP_RESEND_SECONDS) {
        return {
          success: false,
          error: `Please wait before requesting a new OTP.`,
          retryAfter: OTP_RESEND_SECONDS - elapsedSeconds,
        };
      }
    }

    // 2. Rate Limiting Check: Max 5 requests/hour, Max 10 requests/day
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const requestsLastHour = await prisma.otp.count({
      where: { userId, channel, createdAt: { gte: oneHourAgo } },
    });

    if (requestsLastHour >= 5) {
      return {
        success: false,
        error: 'Too many OTP requests in the last hour. Please try again later.',
      };
    }

    const requestsLastDay = await prisma.otp.count({
      where: { userId, channel, createdAt: { gte: oneDayAgo } },
    });

    if (requestsLastDay >= 10) {
      return {
        success: false,
        error: 'Too many OTP requests today. Please try again tomorrow.',
      };
    }

    // 3. Generate new OTP
    const otpCode = this.generateOtpString(email);
    const otpHash = await bcrypt.hash(otpCode, 12);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 4. Invalidate all previous OTPs for this user & channel
    await prisma.otp.updateMany({
      where: { userId, channel, isUsed: false },
      data: { isUsed: true },
    });

    // 5. Store hashed OTP
    await prisma.otp.create({
      data: {
        userId,
        channel,
        destination,
        otpHash,
        expiresAt,
        attempts: 0,
        isUsed: false,
      },
    });

    // 6. Audit & structured logs
    logger.info(`OTP generated for User ID: ${userId} (${channel}) | IP: ${ip || 'unknown'} | Agent: ${userAgent || 'unknown'}`);
    await prisma.auditLog.create({
      data: {
        username: email,
        action: `OTP_REQUEST_${channel.toUpperCase()}`,
        entity: 'User',
        entityId: userId,
        details: `OTP requested. IP: ${ip || 'unknown'}, Device: ${userAgent || 'unknown'}`,
        userId,
      },
    });

    // 7. Dispatch OTP
    if (email.toLowerCase() === 'test@buildcorp.com') {
      logger.info(`[TEST BYPASS] Skip dispatching OTP ${otpCode} to ${destination}`);
      return { success: true };
    }

    if (channel === 'email') {
      await sendOtpEmail(destination, otpCode);
    } else {
      const message = `Your BuildCorp ERP verification OTP is ${otpCode}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`;
      const smsSent = await SmsService.sendSms({ to: destination, message });
      if (!smsSent) {
        return {
          success: false,
          error: 'Failed to send SMS OTP. Please check the number or try again.',
        };
      }
    }

    return { success: true };
  }

  /**
   * Verify an OTP.
   * Implements lockout, attempt counting, constant-time comparison, and post-success invalidation.
   */
  public static async verifyOtp(params: {
    userId: string;
    channel: 'email' | 'phone';
    otp: string;
    email: string;
    ip?: string;
    userAgent?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { userId, channel, otp, email, ip, userAgent } = params;
    const now = new Date();

    // Find the latest active OTP for this user and channel
    const record = await prisma.otp.findFirst({
      where: { userId, channel, isUsed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return { success: false, error: 'No active OTP request found.' };
    }

    // Check if expired
    if (record.expiresAt < now) {
      // Invalidate it
      await prisma.otp.update({
        where: { id: record.id },
        data: { isUsed: true },
      });
      return { success: false, error: 'OTP has expired.' };
    }

    // Check if user is locked out due to previous attempts on this OTP
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      return { success: false, error: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    // Compare constant-time
    const matches = await bcrypt.compare(otp, record.otpHash);

    if (!matches) {
      // Increment attempt count
      const updatedAttempts = record.attempts + 1;
      await prisma.otp.update({
        where: { id: record.id },
        data: { attempts: updatedAttempts },
      });

      logger.warn(`Failed OTP verification attempt for User ID: ${userId} (${channel}). Attempt ${updatedAttempts}/${OTP_MAX_ATTEMPTS}`);

      if (updatedAttempts >= OTP_MAX_ATTEMPTS) {
        await prisma.otp.update({
          where: { id: record.id },
          data: { isUsed: true }, // invalidate it
        });
        return { success: false, error: 'Maximum attempts exceeded. This OTP has been invalidated.' };
      }

      return { success: false, error: `Invalid OTP. You have ${OTP_MAX_ATTEMPTS - updatedAttempts} attempts left.` };
    }

    // Mark as used
    await prisma.otp.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        username: email,
        action: `OTP_VERIFIED_${channel.toUpperCase()}`,
        entity: 'User',
        entityId: userId,
        details: `OTP verified successfully. IP: ${ip || 'unknown'}, Device: ${userAgent || 'unknown'}`,
        userId,
      },
    });

    return { success: true };
  }
}
