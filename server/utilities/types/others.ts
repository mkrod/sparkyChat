import type { SessionData } from "express-session";
import type { Namespace } from "socket.io";

export interface CustomResponse {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}

export type SocketID = { socket_id: string };

export interface User {
    user_id: string;
    username: string;
    email: string;
    name: {
        first: string;
        last: string;
    };
    picture: string;
    created_at: string;
    privacy: {
        read_receipt: boolean;
    }
}

export interface Media {
    content: string;
    caption: string;
    size: number;
    duration?: number; //for audio sake
    type: Message['type'];
    originalName: string;
    thumbnail?: string | undefined;
    uploadedAt: Date;
}

export interface Message {
    _id?: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    content?: string;
    media?: Media;
    type: "text" | "image" | "video" | "audio" | "file";
    timestamp: Date;
    status: "sent" | "delivered" | "read";
    replyTo?: string;
    edited?: boolean;
    metadata?: Record<string, any>;
}

export interface CurrentChatMessageType {
    userData: User;
    messageData: Message[];
}


export interface SocketHandlerType {
    sender_id: string;
    receiver_id: string;
    sess: SessionData;
    io: Namespace;
}

export interface markReadPayload {
    sender_id: string;
    receiver_id: string;
    message_id: string;
}

export interface StartCallPayload {
    callId: string;
    type?: string;
    receiverId: string;
    offer: RTCSessionDescriptionInit;
    caller: User;
}

export interface UpdateCallStatePayload {
    _id: string;
    status: string;
    //initiatorId: string;
    //receiverId: string;
    answer?: RTCSessionDescriptionInit;
}

export interface CustomEvent<T = any> {
    senderId: string;
    remoteUserId: string;
    event: string;
    data?: T;
}

export interface NotificationSettings {
    friend_request: boolean,
    declined_request: boolean,
    accepted_request: boolean,
    unfriended: boolean,
}

export interface Settings {
    user_id: string;
    notification: NotificationSettings;
}