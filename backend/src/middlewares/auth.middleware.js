
import { ENV } from "../lib/env.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next)=>{
    try{
        const token = req.cookies.jwt;
        if(!token) return res.status(400).json({message : "Unauthorized - No token provided"});

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) return res.status(400).json({message : "Unauthorized - Invalid Token"});

        const user = await User.findById(decoded.userId).select("-password");
        if(!user) return res.status(400).json({message : "User not found"});

        req.user = user;
        next();
        
    }catch(error){
        console.log("Error in protectRoute middleware");
        res.status(500).json({message : "Internal server error"});
    }
}

