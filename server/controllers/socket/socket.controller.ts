import type { SessionData } from "express-session";
import type { Socket, Namespace } from "socket.io";
import { markMessageRead, newMessageHandler, userTypingHandler } from "./socket.handler.js";

const SocketController = ({ socket, io, sess }: { socket: Socket, io: Namespace, sess: SessionData}) => {
    socket.on("user_typing", ({ sender_id, receiver_id }) => userTypingHandler({ sender_id, receiver_id, sess, io })); // a user sent that he/she is typing
    socket.on("new_message", ({ message }) => newMessageHandler({ message, io, sess }));
    socket.on("mark_read", (payload) => markMessageRead(payload, io));
}
export default SocketController;