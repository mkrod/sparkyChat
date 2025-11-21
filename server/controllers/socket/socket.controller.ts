import type { SessionData } from "express-session";
import type { Socket, Namespace } from "socket.io";
import { markMessageRead, newMessageHandler, userTypingHandler } from "./socket.handler.js";
import { sendCustomEvent, startCall, updateCallState, markCallSeen } from "./call.socket.controller.js";
import type { CustomEvent } from "../../utilities/types/others.js";

const SocketController = ({ socket, io, sess }: { socket: Socket, io: Namespace, sess: SessionData}) => {
    socket.on("user_typing", ({ sender_id, receiver_id }) => userTypingHandler({ sender_id, receiver_id, sess, io })); // a user sent that he/she is typing
    socket.on("new_message", ({ message }) => newMessageHandler({ message, io, sess }));
    socket.on("mark_read", (payload) => markMessageRead(payload, io));
    socket.on("start_call", (payload) => startCall(payload, sess));
    socket.on("update_call_state", (payload) => updateCallState(payload))
    socket.on("custom_event", (payload: CustomEvent) => sendCustomEvent(payload));
    socket.on("mark_missed_call_as_seen", (payload) => markCallSeen(payload));
}
export default SocketController;