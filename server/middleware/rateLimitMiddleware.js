// Simple memory store for rate limiting
const rateLimit = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxReq = 200;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip);
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= maxReq) {
    res.status(429);
    throw new Error('Too many requests, please try again later.');
  }

  validTimestamps.push(now);
  rateLimit.set(ip, validTimestamps);
  next();
};

export default rateLimiter;