import dotenv from 'dotenv';
dotenv.config();

import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin : [process.env.CLIENT_URL],
        credentials : true,
    }
});


// to store online users  
// {userId : socketId}
const userSocketMap = {} 

// helper fn : in msg controller when msg saved -> to send to particular receiver need socketId -> real time msg send
export function getReceiverSocketId(receiverId){
    return userSocketMap[receiverId];
}

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    const userId = socket.handshake.query.userId;

    // if userId received from client after handshake update userSocetMap and emit to all
    if(userId) {
        userSocketMap[userId] = socket.id
    }

    // broadcasting to all
    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("user disconnected: ", socket.id)

        // after disconnection delete the key from obj and emit to all
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))

    })
})
export {io, app, server}