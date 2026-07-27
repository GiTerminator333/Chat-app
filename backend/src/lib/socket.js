import {Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : ENV.CLIENT_URL,
        credentials : true
    }
});
io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getUserSocketId(userId){
    return userSocketMap[userId];
}

io.on("connection", (socket)=>{
    console.log("a user connected", socket.user.fullName);
    const userId = socket.userId;
    userSocketMap[userId] = socket.id;
    
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // --- Typing indicator relay ---
    // When a user starts typing, notify the receiver
    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("userTyping", { senderId: userId });
        }
    });

    // When a user stops typing, notify the receiver
    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
        }
    });

    socket.on("disconnect", ()=>{
        console.log("a user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
});


export {io, app, server}; 