// In-Memory Token Bucket for API Rate Limiting
// Protects against API spam that would rapidly consume LLM tokens or Firebase reads.

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Validates if an incoming request should be allowed based on a sliding window.
 * Default: 20 requests per minute per IP.
 */
export function validateRateLimit(identifier: string, limit: number = 20, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return { success: true };
  }

  // If the window has expired, reset the counter
  if (now - record.timestamp > windowMs) {
    rateLimitMap.set(identifier, { count: 1, timestamp: now });
    return { success: true };
  }

  // If the limit is breached, block the request
  if (record.count >= limit) {
    return { 
      success: false, 
      remainingTimeMs: windowMs - (now - record.timestamp),
      message: "Rate limit exceeded. Please wait before requesting additional intelligence." 
    };
  }

  record.count += 1;
  return { success: true };
}
