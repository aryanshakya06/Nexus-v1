import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js';
import { User } from '../models/User.js';
import { isSessionActive } from '../config/generateToken.js';

export const isAuth = async(req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if(!token) {
            return res.status(403).json({success: false, message: "Please Login"});
        }

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        if(!decodedData) {
            return res.status(400).json({ success: false, message: "Token Expired"});
        }

        const sessionActive = await isSessionActive(decodedData.id, decodedData.sessionId);
        if(!sessionActive) {
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            res.clearCookie("csrfToken");

            return res.status(401).json({success: false, message: "Session Expired"})
        }

        const cacheUser = await redisClient.get(`user:${decodedData.id}`);
        if(cacheUser) {
            req.user = JSON.parse(cacheUser);
             
            return next();
        }

        const user = await User.findById(decodedData.id).select("-password");

        if(!user) {
            return res.status(400).json({success: false, message: "No user with this ID"});
        }

        await redisClient.setEx(`user:${user._id}`, 3600, JSON.stringify(user));

        req.user = user;
        req.sessionId = decodedData.sessionId;
        next();
    } catch (err) {
        res.status(500).json({success: false, message: err.message});
    }
}

export const authorizedAmin = async(req, res, next) => {
    const user = req.user;

    if(user.role !== "admin") {
        return res.status(401).json({success: false, message: "Not Authorized for this Action"});
    }

    next();
}