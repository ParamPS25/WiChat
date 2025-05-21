import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js'

const app = express();
const PORT = process.env.PORT || 8000

app.use(cors({
    origin : process.env.CLIENT_URL,
    credentials : true,
}))

app.use(cookieParser());
app.use(express.urlencoded({ extended:true }));
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((err) => {
        console.log("eroor connecting to MongoDB" , err);
    })

app.use("/api/auth" , authRoutes);

app.listen(PORT , () => {
    console.log(`Server running on ${PORT}`)
})