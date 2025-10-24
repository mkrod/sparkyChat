import type { Namespace } from "socket.io";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import type { markReadPayload, Message, SocketHandlerType } from "../../utilities/types/others.js";
import type { SessionData } from "express-session";
import { messageModel } from "../../utilities/db/model/messages.model.js";



export const userTypingHandler = async ({ sender_id, receiver_id, sess, io }: SocketHandlerType) => {
    if (!sender_id || !receiver_id) return;
    //lets notify the receiver that sender_id is typing
    const receiver = (await onlineUsersModel.findOne({ user_id: receiver_id }))?.toObject();

    if (!receiver) return;
    //destructure
    const { socket_id, status } = receiver;

    //if they're offline, we'll do nothing.
    if (status === "offline") return;

    //if it reach here, they're not offline
    //lets tell them that someone is typing to them, so they'll update their state
    if (!socket_id) return; //making sure its defined
    io.to(socket_id).emit("user_typing", { sender_id }) //sending them back the event
}

export const newMessageHandler = async ({ message, io, sess }: { message: Message, io: Namespace, sess: SessionData }) => {
    const { user_id } = sess;
    if (!user_id) {
        return;
    }
    try {
        await messageModel.insertOne(message);


        // Find both users' sockets
        const usersSockets = await onlineUsersModel.find({
            user_id: { $in: [user_id, message.receiverId] },
        }).lean();

        const socketIds = usersSockets
            .map(u => u.socket_id)
            .filter((id): id is string => typeof id === "string");

        //console.log("Socket in sendMessage from " + user_id + ": ", socketIds)

        socketIds.forEach((i) => {
            io.to(i).emit("new_message");
            //console.log("Sent event to: ", i)
        })
        // Emit event to both users


    } catch (err) {
        console.log("Error sending message: ", err);
    }

}

export const markMessageRead = async (payload: markReadPayload, io: Namespace) => {
    const { sender_id, receiver_id, message_id } = payload;
    // update the message status and tell the receiver

    //sender_id : who sent the reciept
    //receiver_id:  who is receiving the receipt

    const staus = "read";
    await messageModel.updateOne({ chatId: message_id, receiverId: sender_id }, { $set: { status: "read" } });


    // Find both users' sockets
    const usersSockets = await onlineUsersModel.find({
        user_id: { $in: [sender_id, receiver_id] },
    }).lean();

    const socketIds = usersSockets
        .filter(u => u.status === "online")
        .map(u => u.socket_id)
        .filter((id): id is string => typeof id === "string");


    socketIds.forEach((i) => {
        io.to(i).emit("message_read");
        //console.log("Sent event to: ", i)
    })
    // Emit event to both users



    /*const otherUserSocket = (await onlineUsersModel.findOne({ user_id: receiver_id }))?.toObject();
    console.log(otherUserSocket)
    if (otherUserSocket?.status !== "online") return;
    const socket_id = otherUserSocket.socket_id;
    if (!socket_id) return;
    const data = {
        sender_id, message_id
    }
    console.log("about to send receipt");
    io.to(socket_id).emit("message_read", data);
    console.log("sent receipt");*/
}