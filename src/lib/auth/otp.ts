import crypto from 'crypto';
import bcrypt from 'bcrypt';

const OTP_EXPIRES_MIN = parseInt(process.env.OTP_EXPIRES_MIN || '5', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10);

/**
 * Generate a cryptographically‑secure 6‑digit OTP as a string.
 */
export function generateOtp(): string {
  // crypto.randomInt returns an integer in [min, max)
  const num = crypto.randomInt(0, 1_000_000);
  return num.toString().padStart(6, '0');
}

/**
 * Hash the OTP using bcrypt (same salt rounds as passwords).
 */
export async function hashOtp(otp: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  return await bcrypt.hash(otp, saltRounds);
}

/**
 * Verify a plain OTP against a stored hash.
 */
export async function verifyOtp(otp: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(otp, hash);
}

/**
 * Return the expiry Date object based on the configured minutes.
 */
export function otpExpiryDate(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + OTP_EXPIRES_MIN);
  return now;
}

export const OTP_CONFIG = {
  maxAttempts: OTP_MAX_ATTEMPTS,
  expiresInMinutes: OTP_EXPIRES_MIN,
};
