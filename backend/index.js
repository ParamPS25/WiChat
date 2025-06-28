import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

import { app, server } from './lib/socket.js';
import path from 'path';

const PORT = process.env.PORT || 8000
const __dirname = path.resolve();

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


app.get("/ping", (req, res) => {
  res.send("pong");
});

app.use("/api/auth" , authRoutes);
app.use("/api/messages" , messageRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
    });         
}

server.listen(PORT , () => {
    console.log(`Server running on ${PORT}`)
})
