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
    type: Message['type'];
    originalName: string;
    thumbnail?: string|undefined;
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