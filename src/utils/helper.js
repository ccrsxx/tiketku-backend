import { randomBytes, randomInt } from 'crypto';

/** @returns {string} */
export function generateRandomToken(size = 12) {
  return randomBytes(size).toString('base64url');
}

/** @returns {string} */
export function generateRandomOTP() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}
