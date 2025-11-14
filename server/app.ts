import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/////////// Routes imports ///////////
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import userRoutes from "./routes/user.routes.js";
import proxyRoutes from "./routes/proxy.routes.js";
import messageRoutes from "./routes/message.routes.js";
import callRoutes from "./routes/call.routes.js";

///////////////////////////////////////
///////////////custom middleware////////////////////////
import wsConfig from "./utilities/websocket/ws_conn.js";
import sessionMiddleware from "./utilities/session/index.js";

///////////////////////////////////////////////////////
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//////////////////// Middleware //////////////////////
app.use(sessionMiddleware);
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

////////////////////// SSL //////////////////////////
const sslOptions = {
    key: fs.readFileSync("./keys/server.key"),
    cert: fs.readFileSync("./keys/server.cert"),
};

const server = https.createServer(sslOptions, app);

//////////////////// WebSocket ///////////////////////
wsConfig(server);

////////////////// peer server ///////////////////////

//////////////////// Static files ///////////////////
app.use("/", express.static(path.join(__dirname, "public"), { index: "index.html" }));
// Serve uploads separately for JS previews
/*app.use("/upload", express.static(path.join(__dirname, "public/uploads"), {
    maxAge: "1y",
    immutable: true
}));
app.use("/thumbnail", express.static(path.join(__dirname, "public/thumbnails"), {
    maxAge: "1y",
    immutable: true
}));
*/

//////////////////// Routes /////////////////////////
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/proxy", proxyRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/call", callRoutes)

// Health check
app.get("/api/health", (_, res) => res.sendStatus(200));

/////  remove on production
app.use("/api/user/static", (req, res) => {
    if(!req.query.user_id) return res.send("Please enter a static Id to login");
    const userId = Array.isArray(req.query.user_id) ? req.query.user_id[0] : req.query.user_id;
    if (typeof userId === "string") {
        req.session.user_id = userId;
        res.send("Static user loggedIn");
    } else {
        return res.status(400).send("Invalid user_id");
    }
})

//////////////////// Error handling //////////////////
process.on("uncaughtException", (err) => console.error("Uncaught Exception: ", err));
process.on("unhandledRejection", (err) => console.error("Unhandled Rejection: ", err));
process.on("uncaughtExceptionMonitor", (err) => console.error("Uncaught Exception Monitor: ", err));

//////////////////// Start server ////////////////////
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
