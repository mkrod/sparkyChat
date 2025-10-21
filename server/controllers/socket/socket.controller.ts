import type { SessionData } from "express-session";
import type { Socket, Namespace } from "socket.io";
import type { TypingUsers } from "../../utilities/types/others.js";
import { userTypingHandler } from "./socket.handler.js";

export const typingUsers: Map<string, TypingUsers> = new Map();

const SocketController = ({ socket, io, sess }: { socket: Socket, io: Namespace, sess: SessionData}) => {
    socket.on("user_typing", ({ sender_id, receiver_id }) => userTypingHandler({ sender_id, receiver_id, sess, io })); // a user sent that he/she is typing
}
export default SocketController;