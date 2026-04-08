import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import { startCleanupJobs } from "./src/jobs/cleanup.js";
import { globalLimiter } from "./src/utils/rateLimiter.js";

connectDB()
startCleanupJobs()
app.use(globalLimiter)
app.get("/", (req, res) => {
  res.send("Authentication API is running 🚀");
});

app.listen(3000,()=>{
    console.log("Server is running on PORT 3000");
    
})

