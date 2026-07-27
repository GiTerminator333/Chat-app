import express from "express";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import messgaeRoutes from "./routes/message.route.js";
import { connectToDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messgaeRoutes);


if(ENV.NODE_ENV === "production"){
    const frontendDist = path.join(__dirname, "../../frontend/dist");
    app.use(express.static(frontendDist));
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"));
    });
}

server.listen(ENV.PORT, ()=>{
    connectToDB();
    console.log("server is running on port: " + ENV.PORT);
});


