import cron from "node-cron";
import otpModel from "../models/otp.model.js";
import sessionModel from "../models/session.model.js";

export function startCleanupJobs() {
    
    // JOB 1: Clean up old OTPs every 15 minutes
    // Runs at minute 0, 15, 30, and 45 of every hour
    cron.schedule('*/15 * * * *', async () => {
        console.log("[CRON] Running OTP cleanup job...");
        try {
            // Find the exact time 15 minutes ago
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            // Delete any OTPs created before that time
            const result = await otpModel.deleteMany({
                createdAt: { $lt: fifteenMinsAgo }
            });
            
            console.log(`[CRON] Deleted ${result.deletedCount} expired OTPs.`);
        } catch (error) {
            console.error("[CRON] Error cleaning OTPs:", error);
        }
    });

    // JOB 2: Clean up revoked sessions every night at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log("[CRON] Running Session cleanup job...");
        try {
            // Delete all sessions where 'revoked' is set to true
            const result = await sessionModel.deleteMany({
                revoked: true
            });
            
            console.log(`[CRON] Deleted ${result.deletedCount} revoked sessions.`);
        } catch (error) {
            console.error("[CRON] Error cleaning Sessions:", error);
        }
    });

    console.log("🕒 Background Cleanup Jobs Initialized");
}