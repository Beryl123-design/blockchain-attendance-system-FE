// OTP Service for secure payroll access
// This service handles OTP generation, verification, and security mechanisms

// OTP configuration
const OTP_LENGTH = 6 // 6-digit OTP
const OTP_EXPIRY_MINUTES = 10 // OTP expires after 10 minutes
const MAX_FAILED_ATTEMPTS = 3 // Lock after 3 failed attempts
const LOCKOUT_DURATION_MINUTES = 30 // 30 minute lockout after too many failed attempts

// OTP storage (in a real app, this would be in a secure database)
// Format: { userId: { otp, expiresAt, attempts, lockedUntil, payrollData } }
const otpStore = new Map()

// Types
export interface OtpData {
  otp: string
  expiresAt: Date
  attempts: number
  lockedUntil: Date | null
  payrollData: any // The encrypted payroll data
  payrollMeta: {
    month: string
    department: string
    generatedDate: string
    recipientEmail: string
  }
}

/**
 * Generate a cryptographically secure random OTP
 */
export function generateOTP(): string {
  // Generate a random 6-digit number
  const digits = "0123456789"
  let otp = ""

  // In a browser environment, use the Web Crypto API
  const randomValues = new Uint32Array(OTP_LENGTH)
  window.crypto.getRandomValues(randomValues)

  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[randomValues[i] % 10]
  }

  return otp
}

/**
 * Store an OTP for a specific user and associate it with payroll data
 */
export function storeOTP(userId: string, payrollData: any, payrollMeta: any): string {
  const otp = generateOTP()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000)

  otpStore.set(userId, {
    otp,
    expiresAt,
    attempts: 0,
    lockedUntil: null,
    payrollData,
    payrollMeta,
  })

  // Log OTP creation (in a real app, this would be more secure)
  console.log(`OTP created for user ${userId}: ${otp}, expires at ${expiresAt}`)

  return otp
}

/**
 * Verify an OTP for a specific user
 * Returns the payroll data if successful, null otherwise
 */
export function verifyOTP(
  userId: string,
  inputOTP: string,
): {
  success: boolean
  message: string
  payrollData?: any
  payrollMeta?: any
  remainingAttempts?: number
  lockoutMinutes?: number
} {
  // Check if user has an OTP
  if (!otpStore.has(userId)) {
    return {
      success: false,
      message: "No OTP found for this user. Please request a new OTP.",
    }
  }

  const otpData = otpStore.get(userId) as OtpData
  const now = new Date()

  // Check if account is locked
  if (otpData.lockedUntil && now < otpData.lockedUntil) {
    const minutesRemaining = Math.ceil((otpData.lockedUntil.getTime() - now.getTime()) / (60 * 1000))
    return {
      success: false,
      message: `Account is temporarily locked due to too many failed attempts.`,
      lockoutMinutes: minutesRemaining,
    }
  }

  // Check if OTP has expired
  if (now > otpData.expiresAt) {
    return {
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    }
  }

  // Verify OTP
  if (inputOTP === otpData.otp) {
    // Successful verification - clear the OTP after successful use
    const { payrollData, payrollMeta } = otpData
    otpStore.delete(userId)

    // Log successful verification
    console.log(`OTP verified successfully for user ${userId}`)

    return {
      success: true,
      message: "OTP verified successfully.",
      payrollData,
      payrollMeta,
    }
  } else {
    // Failed verification - increment attempts
    otpData.attempts += 1

    // Check if max attempts reached
    if (otpData.attempts >= MAX_FAILED_ATTEMPTS) {
      // Lock the account
      otpData.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000)

      // Log account lockout
      console.log(`Account ${userId} locked until ${otpData.lockedUntil} due to too many failed attempts`)

      return {
        success: false,
        message: `Too many failed attempts. Your account has been locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
        lockoutMinutes: LOCKOUT_DURATION_MINUTES,
      }
    }

    // Return failure with remaining attempts
    const remainingAttempts = MAX_FAILED_ATTEMPTS - otpData.attempts
    return {
      success: false,
      message: `Invalid OTP. Please try again.`,
      remainingAttempts,
    }
  }
}

/**
 * Check if a user has a valid OTP
 */
export function hasValidOTP(userId: string): boolean {
  if (!otpStore.has(userId)) return false

  const otpData = otpStore.get(userId) as OtpData
  const now = new Date()

  // Check if OTP has expired or account is locked
  if (now > otpData.expiresAt || (otpData.lockedUntil && now < otpData.lockedUntil)) {
    return false
  }

  return true
}

/**
 * Get OTP metadata for a user
 */
export function getOTPMetadata(userId: string): {
  expiresAt?: Date
  lockedUntil?: Date | null
  attempts?: number
  payrollMeta?: any
} {
  if (!otpStore.has(userId)) return {}

  const otpData = otpStore.get(userId) as OtpData
  return {
    expiresAt: otpData.expiresAt,
    lockedUntil: otpData.lockedUntil,
    attempts: otpData.attempts,
    payrollMeta: otpData.payrollMeta,
  }
}

/**
 * Clear an OTP for a specific user
 */
export function clearOTP(userId: string): void {
  otpStore.delete(userId)
}

/**
 * Encrypt payroll data using the OTP as the key
 * In a real application, you would use a proper encryption library
 */
export function encryptWithOTP(data: any, otp: string): string {
  // This is a simplified encryption for demonstration
  // In a real app, you would use a proper encryption library like crypto-js

  // Create a derived key from the OTP (in a real app, use PBKDF2 or similar)
  const key = otp.repeat(Math.ceil(32 / otp.length)).substring(0, 32)

  // For demo purposes, we'll just base64 encode the data with the key
  const dataStr = JSON.stringify({
    data,
    encryptedWith: "OTP-AES-256",
    timestamp: new Date().toISOString(),
  })

  // In a real app, this would be actual encryption
  return btoa(dataStr)
}

/**
 * Decrypt payroll data using the OTP as the key
 */
export function decryptWithOTP(encryptedData: string, otp: string): any {
  // This is a simplified decryption for demonstration
  // In a real app, you would use a proper decryption method

  try {
    // Derive the same key from OTP
    const key = otp.repeat(Math.ceil(32 / otp.length)).substring(0, 32)

    // For demo purposes, we'll just base64 decode
    const decodedData = atob(encryptedData)
    return JSON.parse(decodedData).data
  } catch (error) {
    console.error("Decryption failed:", error)
    return null
  }
}
