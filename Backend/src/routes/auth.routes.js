import {Router} from "express";
import * as authController from "../controllers/auth.controllers.js"
import { authLimiter } from "../utils/rateLimiter.js";

const authRouter  = Router();


// POST /api/auth/register 
authRouter.post("/register", authLimiter, authController.register);

// POST /api/auth/login
authRouter.post("/login", authLimiter, authController.login)

// GET /api/auth/get-me
authRouter.get("/get-me", authLimiter, authController.getMe)

// GET /api/auth/refresh-token
authRouter.get("/refresh-token", authController.refreshToken)

// GET /api/auth/logout
authRouter.get("/logout", authController.logout)

// GET /api/auth/logout-all
authRouter.get("/logout-all", authController.logoutAll)

//GET verify email
authRouter.get("/verify-email", authController.verifyEmail)

// GET /api/auth/sessions -> Returns a list of devices (Chrome, Safari, iPhone, etc)
authRouter.get("/sessions", authController.getActiveSessions);

// DELETE /api/auth/sessions/:sessionId -> Logs out of a specific device
authRouter.delete("/sessions/:sessionId", authController.revokeSession);

export default authRouter;