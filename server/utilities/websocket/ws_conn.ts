// utility/websocket/ws_conn.ts
import { Server } from "socket.io";
import { type Server as HttpsServer } from "https";
import sessionMiddleware from "../session/index.js";
import { onlineUsersModel } from "../db/model/onlineUsers.js";
import type { NextFunction } from "express";
import dotenv from "dotenv";
import SocketController from "../../controllers/socket/socket.controller.js";
import { updateUserLastSeen } from "../../controllers/user/user.controllers.js";
dotenv.config();


export default function initWebSockets(server: HttpsServer) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });
    const apiNamespace = io.of("/api");


    apiNamespace.use((socket, next) => {
        sessionMiddleware(socket.request as any, {} as any, next as NextFunction);
    });


    apiNamespace.on("connection", async (socket) => {
        console.log("WS Connected:", socket.id);

        const sess = (socket.request as any).session;
        if (sess?.user_id) {
            try {
                await onlineUsersModel.updateOne(
                    { user_id: sess.user_id },
                    { $set: { socket_id: socket.id, status: "online" } },
                    { upsert: true }
                );
                console.log(`user ${sess.user_id} saved as online`);
                apiNamespace.emit("presence_changed");
            } catch (err) {
                console.error(`Error saving user ${sess.user_id}:`, err);
            }
        }

        //i dont want to flood this file with controllers
        //i pass socket, io and sess to controller
        SocketController({ socket, io: apiNamespace, sess });

        socket.on("disconnect", async () => {
            try {
                updateUserLastSeen({ socket_id: socket.id});
                //await onlineUsersModel.deleteMany({ socket_id: socket.id });
                await onlineUsersModel.updateOne(
                    { socket_id: socket.id },
                    { $set: { status: "offline" } }
                );
                console.log(`user ${sess?.user_id} disconnected`);
                apiNamespace.emit("presence_changed");
            } catch (err) {
                console.error(`Error removing user ${sess?.user_id}:`, err);
            }
        });
    });

    return { io, apiNamespace };
}
