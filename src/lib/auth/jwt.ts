import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * Generate an access token for a given user payload.
 */
export function generateAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

/**
 * Verify an access token and return the decoded payload.
 */
export function verifyAccessToken(token: string): object | null {
  try {
    return jwt.verify(token, JWT_SECRET) as object;
  } catch (err) {
    return null;
  }
}
