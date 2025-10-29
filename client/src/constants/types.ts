import type { CSSProperties, Dispatch, SetStateAction } from "react";

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
    last_login: Date;
    created_at: string;
    privacy: {
        read_receipt: boolean;
    };
}


export type RawMedia = {
    content: File;
    caption: string;
}

export interface Media {
    content: string;
    caption: string;
    size: number;
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

export type GroupedMessages = {
    dateLabel: string;
    messages: Message[];
};


export interface Presence {
    user_id: string;
    status: "online" | "offline" | "away" | "busy";
}

export interface NotificationCounts {
    messages: number;
    calls: number;
    alerts: number;
}

export interface AppLayoutContextType {
    currentChatId: string | null;
    setCurrentChatId: Dispatch<SetStateAction<string | null>>;
}


export interface CurrentChatMessageType {
    otherUser: User;
    messages: Message[];
}

export interface TypingType {
    user_id: string;
    isTyping: boolean;
}


export interface PreviewMediaData {
    previewUrl: string; //if photo or video
    fileType: "photo" | "video" | "audio" | "others";
    fileName: string;
    fileExtension: string;
    fileSize: string; // KB, MB, GB, TB
}

export interface UserListTab {
    label: string;
    code: "add_friends" | "friends" | "groups" | "requests";
}

export interface UserList extends User {
    presence: Presence;
    friends: boolean,
    requested: boolean,
    incoming_request: boolean,
    mutual_friends: string[];
}

export interface AllUsersType {
    page: number,
    perPage: number,
    total: number,
    totalPages: number,
    from: number,
    to: number,
    results: UserList[];
}
