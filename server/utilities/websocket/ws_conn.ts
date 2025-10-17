// utility/websocket/ws_conn.ts
import { Server } from "socket.io";
import { type Server as HttpsServer } from "https";
import sessionMiddleware from "../session/index.js";
import { onlineUsersModel } from "../db/model/onlineUsers.js";
import type { NextFunction } from "express";

export default function initWebSockets(server: HttpsServer) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT,
            credentials: true,
        },
    });

    io.use((socket, next) => {
        sessionMiddleware(socket.request as any, {} as any, next as NextFunction);
    });

    io.on("connection", async (socket) => {
        console.log("WS Connected:", socket.id);

        const sess = (socket.request as any).session;
        if (sess?.user_id) {
            try {
                await onlineUsersModel.updateOne(
                    { user_id: sess.user_id },
                    { $set: { socket_id: socket.id } },
                    { upsert: true }
                );
                console.log(`user ${sess.user_id} saved as online`);
            } catch (err) {
                console.error(`Error saving user ${sess.user_id}:`, err);
            }
        }

        socket.on("disconnect", async () => {
            try {
                await onlineUsersModel.deleteMany({ socket_id: socket.id });
                console.log(`user ${sess?.user_id} disconnected`);
            } catch (err) {
                console.error(`Error removing user ${sess?.user_id}:`, err);
            }
        });
    });

    return io;
}
