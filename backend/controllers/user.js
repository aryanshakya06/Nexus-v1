import { loginSchema, registerSchema } from "../config/zod.js";
import { redisClient } from "../index.js";
import tryCatch from "../middlewares/tryCatch.js";
import sanitize from "mongo-sanitize";
import { User } from "../models/User.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import SendmailTransport from "nodemailer/lib/sendmail-transport/index.js";
import sendMail from "../config/sendMail.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";
import { success } from "zod";
import { generateAccessToken, generateToken, revokeRefresToken, verifyRefreshToken } from "../config/generateToken.js";
import { generateCSRFToken } from "../config/csrfMiddleware.js";

export const registerUser = tryCatch(async(req, res) => {
    const sanitizedBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizedBody);

    if(!validation.success){
        const err = validation.error;

        let firstErrorMessage = "Validation Failed";
        let allErrors = [];

        if(err?.issues && Array.isArray(err.issues)){
            allErrors = err.issues.map((issue) => ({
                field: issue.path ? issue.path.join("."): "Uknown",
                message: issue.message || "Validation Error",
                code: issue.code,
            }));

            firstErrorMessage = allErrors[0]?.message;
        }

        return res.status(400).json({success: false, message: firstErrorMessage, error: allErrors});
    }

    const {name, email, password} = validation.data;

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`
    
    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({ success: false, message: "Too many requests! Try after 1 minute"});
    }

    const existingUser = await User.findOne({email});
    if(existingUser) {
        return res.status(400).json({success: false, message: "User already exists"})
    }
    
    const hashedPass = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyKey = `verify:${verifyToken}`;
    const dataToStore = JSON.stringify({
        name,
        email,
        password: hashedPass
    })

    await redisClient.set(verifyKey, dataToStore, {EX: 300});
    
    const subject = "Verify your email for registration";
    const html = getVerifyEmailHtml({email, token: verifyToken});

    await sendMail({email, subject, html});
    await redisClient.set(rateLimitKey, "true", {EX: 60});

    res.json({ success: true, message: `Verification link sent to ${email}. Link will expire in 5 minutes.`});
});

export const verifyUser = tryCatch( async(req, res) => {
    const {token} = req.params;

    if(!token) {
        return res.status(400).json({success: false, message: "Token is Required"});
    }

    const verifyKey = `verify:${token}`;

    const userDataJson = await redisClient.get(verifyKey);

    if(!userDataJson) {
        return res.status(400).json({success: false, message: "Verification Link is expired"});
    }

    await redisClient.del(verifyKey);

    const userData = JSON.parse(userDataJson);

    const existingUser = await User.findOne({email: userData.email});
    if(existingUser) {
        return res.status(400).json({
            success: false, message: "User already exists"
        })
    }

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password
    });

    return res.status(201).json({
        success: true, 
        message: "Email Verified successfully! Account Created",
        user: {_id: newUser._id, name: newUser.name, email: newUser.email}
    })
})

export const loginUser = tryCatch( async(req, res) => {
    const sanitizedBody = sanitize(req.body);
    const validation = loginSchema.safeParse(sanitizedBody);

    if(!validation.success){
        const err = validation.error;

        let firstErrorMessage = "Validation Failed";
        let allErrors = [];

        if(err?.issues && Array.isArray(err.issues)){
            allErrors = err.issues.map((issue) => ({
                field: issue.path ? issue.path.join("."): "Uknown",
                message: issue.message || "Validation Error",
                code: issue.code,
            }));

            firstErrorMessage = allErrors[0]?.message;
        }

        return res.status(400).json({success: false, message: firstErrorMessage, error: allErrors});
    }

    const {email, password} = validation.data;    
    
    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`

    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({ success: false, message: "Too many requests! Try after 1 minute"});
    }    

    const user = await User.findOne({email});

    if(!user) {
        return res.status(400).json({success: false, message: "Invalid Credentials", error: "User not registered"})
    }

    const comparePass = await bcrypt.compare(password, user.password);
    
    if(!comparePass) {
        return res.status(400).json({success: false, message: "Invalid Credentials", error: "Wrong Password"})
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;

    await redisClient.set(otpKey, JSON.stringify(otp), {EX: 300});

    const subject = "OTP for Verification";
    const html = getOtpHtml({email, otp});
    await sendMail({email, subject, html});
    await redisClient.set(rateLimitKey, "true", {EX: 60});

    return res.json({success: true, message:`OTP sent at ${email}. OTP valid for 5 minutes`});
})

export const verifyOtp = tryCatch( async(req, res) => {
    const { email, otp} = req.body;

    if(!email  || !otp) {
        return res.status(400).json({ success: false, message: "All fields are required"});
    }

    const otpKey = `otp:${email}`;
    const storedOtpString = await redisClient.get(otpKey);

    if(!storedOtpString) {
        return res.status(400).json({ success: false, message: "OTP Expired"});
    }

    const storedOtp = JSON.parse(storedOtpString);

    if(storedOtp !== otp) {
        return res.status(400).json({success: false, message: "Invalid OTP"});
    }

    await redisClient.del(otpKey);

    const user = await User.findOne({email});

    const tokenData = await generateToken(user._id, res);

    return res.status(200).json({ 
        success: true, 
        message: `Welcome, ${user.name}`, 
        user,
        sessionInfo: {
            sessionId: tokenData.sessionId,
            loginTime: new Date().toISOString(),
            csrfToken: tokenData.csrfToken
        }
    });
})

export const myProfile = tryCatch( async(req,res) => {
    const user = req.user;
    const sessionId = req.sessionId;
    const sessionData = await redisClient.get(`session:${sessionId}`);

    let sessionInfo = null;
    if(sessionData) {
        const parsedSession = JSON.parse(sessionData);
        sessionInfo = {
            sessionId,
            loginTime: parsedSession.createdAt,
            lastActivity: parsedSession.lastActivity
        }
    }
    res.json(user, sessionInfo);
})

export const refreshToken = tryCatch( async(req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken) {
        return res.status(401).json({success: false, message: "Invalid Refresh Token"})
    }

    const decode = await verifyRefreshToken(refreshToken);

    if(!decode) {
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.clearCookie("csrfToken");
        return res.status(401).json({ success: false, message: "Session Expired"});
    }
 
    generateAccessToken(decode.id, decode.sessionId, res);

    return res.status(200).json({success: true, message: "Token Refreshed"});
})

export const logoutUser = tryCatch(async(req, res) => {
    const userId = req.user._id;
    await revokeRefresToken(userId);

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    res.clearCookie("csrfToken");

    await redisClient.del(`user:${userId}`);

    return res.status(200).json({success: true, message: "Logged out successfully"});
})

export const refreshCSRF = tryCatch(async(req,res) => {
    const userId = req.user._id;
    const newCSRFToken = await generateCSRFToken(userId, res);

    return res.status(200).json({success: true, 
        message: "CSRF Token refreshed Succesfully",
        csrfToken: newCSRFToken})
})