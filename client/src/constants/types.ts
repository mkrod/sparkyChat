import type { CSSProperties } from "react";

export interface colorScheme {
    background: CSSProperties['background'];
    fadeBackground: CSSProperties['background'];
    text: CSSProperties['color'];
    fadedBorder: CSSProperties['borderColor'];
    textFade: CSSProperties['color'];
    textFadeSecondary: CSSProperties['color'];
}

export type Scheme = "dark" | "light";

export interface Response {
    message?: string | undefined;
    status?: number | undefined;
    data?: any | undefined;
}

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

export interface MessageList {
    _id: string,
    unreadCount: number,
    lastMessage: string,
    lastMessageType: Message['type'],
    lastMessageStatus: Message['status'],
    lastTimestamp: Date,
    lastSenderId: string,
    otherPartyData: {
        name: {
            first: string;
            last: string;
        },
        picture: string;
        user_id: string;
    }
}


export interface Presence {
    user_id: string;
    status: "online" | "offline" | "away" | "busy";
}