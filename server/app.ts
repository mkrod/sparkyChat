import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";


/////////// Routes imports ///////////

import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import userRoutes from "./routes/user.routes.js";
import proxyRoutes from "./routes/proxy.routes.js";


///////////////////////////////////////
///////////////////////////////////////
///////////////custom ware////////////////////////
import wsConfig from "./utilities/websocket/ws_conn.js";
import sessionMiddleware from "./utilities/session/index.js";


///////////////////////////////////////////////////////
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();






app.use(sessionMiddleware);
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());

app.use(cookieParser());

//ssl
const sslOptions = {
    key: fs.readFileSync("./keys/server.key"),
    cert: fs.readFileSync("./keys/server.cert"),
};

const server = https.createServer(sslOptions, app);


wsConfig(server);
////////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//////////////////////routes///////////////////////////

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/proxy", proxyRoutes);

app.get("/", (_, res) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.send("Hello, World!");
});
//////////////////////////////////////
//error handling
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception: ", err);
});
process.on("unhandledRejection", (err) => {
    console.error("unhandled Rejection: ", err);
});
process.on("uncaughtExceptionMonitor", (err) => {
    console.error("Uncaught Exception Monitor: ", err);
});

//Start the server
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));