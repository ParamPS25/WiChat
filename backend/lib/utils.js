import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken"

export const generateToken = (userId, email , res) => {
    const token = jwt.sign({
        id : userId,
        email : email,
    },
    process.env.JWT_SECRET,
    {expiresIn : '7d'},
    );

    res.cookie("token", token ,{
        httpOnly: true,                                                        // only accessible by the web server
        secure: process.env.NODE_ENV === 'production',                        // set to true if using https
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',    // protect against CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000                                     // 7days
    })

    return token;
} 