import express from "express";
import https from "https";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ExpressPeerServer } from "peer"


///////////////////////////////////////////////////////
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();


//////////////////// Middleware //////////////////////
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

const peerServer = ExpressPeerServer(server, {
    path: "/peerjs",
    // @ts-expect-error debug is not in type but runtime supports it
    debug: true,
});

peerServer.on('connection', (client) => console.log('Peer connected', client.getId()));
peerServer.on('disconnect', (client) => console.log('Peer disconnected', client.getId()));

app.use("/peerjs", peerServer);


//////////////////// Error handling //////////////////
process.on("uncaughtException", (err) => console.error("Uncaught Exception: ", err));
process.on("unhandledRejection", (err) => console.error("Unhandled Rejection: ", err));
process.on("uncaughtExceptionMonitor", (err) => console.error("Uncaught Exception Monitor: ", err));

//////////////////// Start server ////////////////////
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));