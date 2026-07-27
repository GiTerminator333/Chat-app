import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res)=>{
    try{
        const {fullName, email, password} = req.body;

        if(!fullName || !email || !password){
            return res.status(400).json({message : "All fields are required"});
        }
        
        if(password.length < 6){
            return res.status(400).json({message : "Password must be atleast 6 character long"});
        }
        
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if(!emailRegex.test(email)){
            return res.status(400).json({message : "Invalid email address provided"});
        }

        const user = await User.findOne({email : email});
        if(user) return res.status(400).json({message : "Email already exisit"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashedPassword
        });

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);
            res.status(201).json({
                id : savedUser._id,
                fullName : savedUser.fullName,
                email : savedUser.email,
                profilePic : savedUser.profilePic
            })

            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
            }catch(error){
                console.log("Error in sending welcome email", error);
            }
        }else{
            res.status(400).json({message : "Invalid data"});
        }
    }catch(error){
        console.log("Error in signup controller", error.message);
        res.status(500).json({message : "internal server error"});
    }
}

export const login = async (req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message : "All fields are required"});
        }

        const user = await User.findOne({email : email});
        
        if(!user){
            return res.status(400).json({message : "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message : "Invalid Credentials"});
        }

        generateToken(user._id, res);
        res.status(200).json({
            userId : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePic : user.profilePic
        })
        
    }catch(error){
        console.log("Error in login controller", error.message);
        res.status(500).json({message : "internal server error"});
    }
}

export const logout = (_, res)=>{
    res.cookie("jwt", "", {maxAge : 0});
    res.status(200).json({message : "User logged out successfully"});
}

export const updateProfile = async (req, res)=>{
    try{
        const {profilePic} = req.body;
        if(!profilePic) return res.status(400).json({message : "Profile picture is required"});

        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic : uploadResponse.secure_url}, {new : true}).select("-password");
        
        return res.status(200).json(updatedUser);
    }catch(error){
        console.log("Error in update profile controller", error.message);
        res.status(500).json({message : "internal server error"});
    }
} 