/**
 * src/lib/otp-store.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OTP storage backed by MongoDB Atlas via Prisma.
 * OTPs survive server restarts, deployments, and horizontal scaling.
 */

import prisma from './prisma';

const TTL_MINUTES = 5;

/**
 * Generate a 6-digit OTP, persist it to MongoDB, and return the code.
 * Any pre-existing OTP for this email is replaced.
 */
export async function generateOTP(email: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

  // Replace any existing OTP for this email
  await prisma.otp.deleteMany({ where: { email } });
  await prisma.otp.create({ data: { email, otpCode: otp, expiresAt } });

  return otp;
}

/**
 * Verify an OTP for the given email.
 * Returns true only if the OTP exists and has not expired.
 * Deletes the OTP record on success (one-time use).
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const record = await prisma.otp.findFirst({ where: { email, otpCode: otp } });

  if (!record) return false;

  if (record.expiresAt < new Date()) {
    await prisma.otp.deleteMany({ where: { email } });
    return false;
  }

  // One-time use — delete after successful verification
  await prisma.otp.deleteMany({ where: { email } });
  return true;
}
