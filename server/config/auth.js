require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpire: '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
