interface CustomResponse {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}

type SocketID = { socket_id: string };

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
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    type: "text" | "image" | "video" | "audio" | "file";
    timestamp: number;
    status: "sent" | "delivered" | "read";
    replyTo?: string;
    edited?: boolean;
    metadata?: Record<string, any>;
}

export interface CurrentChatMessageType {
    userData: User;
    messageData: Message[];
}

export type { CustomResponse, SocketID }