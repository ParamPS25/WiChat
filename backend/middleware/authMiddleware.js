import dotenv from 'dotenv';
dotenv.config();

import jwt, { decode } from "jsonwebtoken"
import User from "../models/userSchema.js"

export const protectRoute = async (req,res,next) => {
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({
                message : "unauthorized - no token provided"
            })
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(!decoded){
            return res.status(401).json({
                message : "unauthorized - Invalid token"
            })
        }

        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }

        req.user = user
        return next();

    } catch (err){
        console.error("error in authRoute middleware : ", err.message );
        res.status(500).json({
            message : "internal server Error"
        })
    }
}