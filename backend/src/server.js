import express from "express";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import messgaeRoutes from "./routes/message.route.js";
import { connectToDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();
app.use(express.json({limit : "10mb"}));
app.use(cors({origin : ENV.CLIENT_URL, credentials : true}))
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messgaeRoutes);


if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend", "dist")));
    const indexFile = path.join(__dirname, "../frontend", "dist", "index.html");
    app.get("*", (req, res) => {
        res.sendFile(indexFile);
    });
}

server.listen(ENV.PORT, ()=>{
    connectToDB();
    console.log("server is running on port: " + ENV.PORT);
});


