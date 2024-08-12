const rateLimit = require('express-rate-limit');

// Temel rate limiting middleware'i
module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her 15 dakika içinde maksimum 100 istek
    message: 'Too many requests have been sent, please try again in 15 minutes.',
    headers: true, // Rate limit bilgilerini yanıt başlıklarına ekler
});