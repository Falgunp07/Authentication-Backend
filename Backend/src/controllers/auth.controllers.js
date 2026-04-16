import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.services.js";
import otpModel from "../models/otp.model.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";


export async function register(req,res){
    const {username, email,password} = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or:[
            { username },
            { email }
        ]
    })

    if(isAlreadyRegistered){
       return res.status(409).json({
            message:"Username or mail already registered"
        })
    }

    const hashedPassword =  crypto.createHash("sha256").update(password).digest("hex");

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.create({
        email,
        user: user._id,
        otpHash
    })

    await sendEmail(email, "Verify your email", `Your OTP is ${otp}`, html)



    res.status(201).json({
        message: "User registered successfully",
        user:{
            username: user.username,
            email : user.email,
            verified: user.verified
        },
    })
}

export async function login(req,res){
    const {email,password} = req.body;

    const user = await userModel.findOne({email})
    if(!user){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            message:"Please verify your email before logging in"
        })
    }
    
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword === user.password;

    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    )
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })
    
    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET, {
        expiresIn: "15m"
    })

    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    

    res.status(200).json({
        message: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email
        },
        token: accessToken
    })
}


export async function getMe(req,res){
    const token = req.headers.authorization?.split(" ")[ 1 ];

    if(!token){
        return res.status(401).json({
            message:"token not found"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message:"user fetched successfully", 
        user:{
            username: user.username,
            email: user.email,
        }
    })
}

export async function refreshToken(req,res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)


    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session){
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id
    },  config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    const newRefreshToken = jwt.sign({
        id: decoded.id
    },  config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )


    const newRefreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken,{
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        token: accessToken
    
    })
}

export async function logout(req,res){
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
        res.status(400).json({
            message:"Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if(!session){
        return res.status(400).json({
            message: "Invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")

    res.status(200).json({
        message:"Logged out successfully"
    })
}

export async function logoutAll(req,res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(400).json({
            message:"Refresh token not found"
        
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    },  {
        revoked: true
    })

    res.clearCookie("refreshToken").status(200).json({
        message: "Logged out from all devices successfully"
    })

}

export async function verifyEmail(req,res){
    const {otp,email} = req.body;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    })

    if(!otpDoc){
        return res.status(400).json({
            message:"Invalid OTP"
        })
    }
    const user = await userModel.findByIdAndUpdate(otpDoc.user,{
        verified: true
    })

    await otpModel.deleteMany({
        user: otpDoc.user
    })
    return res.status(200).json({
        message:"Email verified successfully",
        user:{
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    })
}

// GET all active devices/sessions for the logged-in user
export async function getActiveSessions(req, res) {
    try {
        // 1. Manually extract the token and verify it (like getMe)
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token not found" });
        
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const userId = decoded.id; // Get the user ID from the verified token

        // 2. Find all active sessions for this user
        const sessions = await sessionModel.find({ 
            user: userId,
            revoked: false 
        }).select("-refreshTokenHash"); 

        return res.status(200).json({
            message: "Active sessions retrieved successfully",
            sessions
        });
    } catch (error) {
         if (error.name === "TokenExpiredError") {
             // If the error is specifically because of time running out, send a 401!
             return res.status(401).json({ message: "Token has expired, please log in again." });
        }
        console.error(error);
        return res.status(500).json({ message: "Invalid token or server error" });
    }
}


// POST/DELETE to revoke a specific session (remote logout)
export async function revokeSession(req, res) {
    try {
        // 1. Manually extract the token and verify it
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Token not found" });
        
        const decoded = jwt.verify(token, config.JWT_SECRET);
        const userId = decoded.id; // Get the user ID from the verified token

        const { sessionId } = req.params;

        // 2. Find the exact session and make sure it belongs to THIS user
        const session = await sessionModel.findOne({ 
            _id: sessionId, 
            user: userId 
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // 3. Set revoked to true (this essentially kills the session)
        session.revoked = true;
        await session.save();

        return res.status(200).json({
            message: "Session successfully revoked"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Invalid token or server error" });
    }
}