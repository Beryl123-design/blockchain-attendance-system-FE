// Simple in-memory rate limiter
// In production, use Redis or another distributed store

type RateLimitRecord = {
  count: number
  resetAt: number
}

const rateLimits: Map<string, RateLimitRecord> = new Map()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimits.get(key)

  // If no record exists or the window has expired, create a new record
  if (!record || record.resetAt <= now) {
    rateLimits.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return false
  }

  // Increment the count
  record.count += 1

  // Check if the limit has been exceeded
  if (record.count > limit) {
    return true
  }

  return false
}
