import { generateToken } from "../lib/utils.js";
import User from "../models/userSchema.js"
import bcrypt from "bcryptjs"

export const handleSignup = async (req, res) => {
    const {fullName,password,email} = req.body;

    try{
        if(!fullName || !password || !email){
            return res.status(400).json({
                message : "All fields are required"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                message : "password length should not be less than 6"
            })
        }
        const user = await User.findOne({email})
        
        if(user) {
            return res.status(400).json({
                message : "Email already registered"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hasedPassword = await bcrypt.hash(password,salt);
        
        const newUser = new User({
            fullName,
            email,
            password : hasedPassword
        })

        if(newUser){
            generateToken(newUser._id,email,res)
            await newUser.save();

            res.status(200).json({
                "success": true,
                user : newUser,
            });
        }
        else{
            res.status(400).json({
                success : false,
                message : "Invalid User Data"
            })
        }
    } catch(err){
        console.error("error : ", err.message)
        res.status(500).json({
            success : false,
            message : "Internal Server Error",
            error : "Failed to signUp"
        })
    }
};

export const handleLogin = async (req,res) => {
    const {email,password} = req.body;

    try{
        const user = await User.findOne({email})

        if(!user) {
            return res.status(400).json({
                message : "Invalid credentials"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password , user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({
                message : "Invalid Password"
            })
        };

        generateToken(user._id,email,res);

        res.status(200).json({
            success : true,
            user,
        })
    } catch(err){
        console.error("error : ", err.message)
        res.status(500).json({
            success : false,
            message : "Internal Server Error",
            error : "Failed to Login"
        })
    }
};


export const handleLogout = async (req,res) => {
    try{
        res.cookie("token","",{
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        })

        res.status(200).json({
        success: true,
        message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Logout failed", 
            error: error.message 
        });
    }
}