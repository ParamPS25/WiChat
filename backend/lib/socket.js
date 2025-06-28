import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose'
import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from '../models/messageSchema.js';

const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: [process.env.CLIENT_URL],
//         credentials: true,
//     }
// });

const io = new Server(server, {
  cors: {
    origin: true, // allow same-origin requests dynamically
    credentials: true,
  },
});


// to store online users  
// {userId : socketId}
const userSocketMap = {}

// helper fn : in msg controller when msg saved -> to send to particular receiver need socketId -> real time msg send
export function getReceiverSocketId(receiverId) {
    return userSocketMap[receiverId];
}

io.on("connection", async (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId;

    // if userId received from client after handshake update userSocetMap and emit to all
    if (userId) {
        userSocketMap[userId] = socket.id

        // broadcasting to all
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

        // Send unread count for each sender
        try {
            const messages = await Message.aggregate([
                {
                    $match: {
                        receiverId: new mongoose.Types.ObjectId(userId),
                        status: { $ne: "read" }
                    }
                },
                {
                    $group: {
                        _id: "$senderId",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const unreadCounts = {};
            messages.forEach(msg => {
                unreadCounts[msg._id.toString()] = msg.count;
            });

            // Emit the counts only to the current connected user
            io.to(socket.id).emit("initialUnreadCounts", unreadCounts);

        } catch (error) {
            console.error("Error fetching initial unread counts:", error.message);
        }

    }



    socket.on("disconnect", () => {
        console.log("user disconnected: ", socket.id)

        // after disconnection delete the key from obj and emit to all
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))

    })
})
export { io, app, server }