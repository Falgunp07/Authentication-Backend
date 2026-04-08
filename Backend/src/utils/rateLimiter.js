import rateLimit from "express-rate-limit";

// 1. General API Limiter (Protects your whole app from DDoS)
// Max 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { message: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// 2. Strict Auth Limiter (Protects login/register from password guessing)
// Max 5 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { message: "Too many login/registration attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});