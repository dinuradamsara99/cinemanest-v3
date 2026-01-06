/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
    return new Date() > new Date(expiresAt);
}

/**
 * Get OTP expiration time (5 minutes from now)
 */
export function getOTPExpiration(): Date {
    const now = new Date();
    return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
}
