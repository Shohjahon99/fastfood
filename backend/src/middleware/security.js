const rateLimit = require('express-rate-limit');

// Login uchun qat'iy limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 10,
  message: { success: false, message: '10 ta muvaffaqiyatsiz urinish. 15 daqiqadan keyin qayta urining.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Umumiy API limit
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 daqiqa
  max: 200,
  message: { success: false, message: 'Juda ko\'p so\'rov yuborildi. Biroz kuting.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitize qilish
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        // XSS himoya
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  next();
};

module.exports = { loginLimiter, apiLimiter, sanitizeInput };
