/**
 * Rate limiting middleware for Strapi API endpoints
 * Protects against brute force attacks and DoS attempts
 */

const crypto = require('crypto');

// Simple in-memory store for rate limiting
const requestStore = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now - value.resetTime > 0) {
      requestStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Skip rate limiting for admin and internal routes
    if (
      ctx.request.url.startsWith('/admin') ||
      ctx.request.url.startsWith('/_health') ||
      ctx.request.url.startsWith('/upload')
    ) {
      return await next();
    }

    // Default config values
    const {
      interval = 60 * 1000, // 1 minute
      max = 100, // 100 requests per interval
      delayAfter = 50, // Start delaying after 50 requests
      prefixKey = 'rl_',
    } = config;

    // Generate key based on IP address
    const identifier = ctx.request.ip || ctx.request.header['x-forwarded-for'];
    const hash = crypto.createHash('sha256').update(identifier).digest('hex');
    const key = prefixKey + hash;

    // Get current request count
    const now = Date.now();
    const record = requestStore.get(key) || {
      count: 0,
      resetTime: now + interval,
      startTime: now,
    };

    // Reset if interval has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + interval;
      record.startTime = now;
    }

    // Increment request count
    record.count += 1;
    requestStore.set(key, record);

    // Set rate limit headers
    ctx.set('X-RateLimit-Limit', max.toString());
    ctx.set('X-RateLimit-Remaining', Math.max(0, max - record.count).toString());
    ctx.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    // Check if rate limit exceeded
    if (record.count > max) {
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'TooManyRequestsError',
          message: 'Too many requests, please try again later.',
          details: {
            limit: max,
            resetTime: new Date(record.resetTime).toISOString(),
          },
        },
      };
      return;
    }

    // Add delay for requests exceeding delayAfter threshold
    if (record.count > delayAfter) {
      const delay = (record.count - delayAfter) * 100; // 100ms per excess request
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 3000))); // Max 3s delay
    }

    await next();
  };
};
