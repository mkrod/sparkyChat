import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import type { SocketHandlerType } from "../../utilities/types/others.js";



export const userTypingHandler = async ({ sender_id, receiver_id, sess, io }: SocketHandlerType) => {
    if (!sender_id || !receiver_id) return;
    //lets notify the receiver that sender_id is typing
    const receiver = (await onlineUsersModel.findOne({ user_id: receiver_id }))?.toObject();

    if (!receiver) return;
    //destructure
    const { socket_id, status } = receiver;

    //if they're offline, we'll do nothing.
    if(status === "offline") return;

    //if it reach here, they're not offline
    //lets tell them that someone is typing to them, so they'll update their state
    if(!socket_id) return; //making sure its defined
    io.to(socket_id).emit("user_typing", { sender_id }) //sending them back the event
}