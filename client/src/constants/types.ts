import type { CSSProperties, Dispatch, SetStateAction } from "react";
import type { SignalData } from "simple-peer";

export interface colorScheme {
    background: CSSProperties['background'];
    fadeBackground: CSSProperties['background'];
    text: CSSProperties['color'];
    fadedBorder: CSSProperties['borderColor'];
    textFade: CSSProperties['color'];
    textFadeSecondary: CSSProperties['color'];
}

export type Scheme = "dark" | "light";


export interface Prompt {
    type: "success" | "error";
    title: string;
    body?: string;
}

export interface Response<T = any> {
    status: number | undefined;
    success?: boolean;
    message?: string;
    data: T;
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
    duration: number; //for audio
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

export type NotificationCountsIndex = "chats" | "calls";

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
    count?: Promise<number>;
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

interface Requester extends User {
    presence: Presence
}

export interface RequestList {
    requester: Requester;
    mutual_friends: string[];
}

export interface AllRequestsType {
    page: number,
    perPage: number,
    total: number,
    totalPages: number,
    from: number,
    to: number,
    results: RequestList[];
}

export interface FriendList extends User {
    presence: Presence;
    mutual_friends: string[];
}

export interface AllFriendsType {
    page: number,
    perPage: number,
    total: number,
    totalPages: number,
    from: number,
    to: number,
    results: FriendList[];
}

export interface CallUser {
    user_id: string;
    username: string;
    email: string;
    name: {
        first: string;
        last: string;
    };
    picture: string;
}

export type CallStatus =
    | "initiated"
    | "ringing"
    | "accepted"
    | "connected"
    | "connecting"
    | "ended"
    | "rejected";

export type CallType = "voice" | "video";

export interface CallState {
    _id: string;
    initiatorId: string;
    receiverId: string;
    type: CallType;
    status: CallStatus;
    initiatorSocketId?: string;
    receiverSocketId?: string;
    lastActivityAt: string;
    createdAt: string;
    updatedAt: string;
    initiator: User;
    receiver: User;
    offer: SignalData;
    answer: SignalData;
}

export interface CallLog {
    _id: string;
    callId?: string;
    initiatorId: string;
    receiverId: string;
    type: CallType;
    startedAt: string;
    acceptedAt?: string;
    endedAt: string;
    durationSeconds?: number;
    endReason: "hangup" | "rejected" | "missed" | "failed";
    status: "completed" | "rejected" | "missed";
    read: boolean;
    initiator: User;
    receiver: User;
    createdAt: string;
    updatedAt: string;
}


export interface StartCallPayload {
    type: "video" | "voice";
    receiverId: string;
    offer?: SignalData;
}

export interface UpdateCallStatePayload {
    _id: string,
    status: string;
    answer?: SignalData;
    //initiatorId: string;
    //receiverId: string;
}
export interface UpdateCallStatusPayload {
    _id: string;
    //receiver_id: string,
    status: string;
    //initiatorId: string;
    //receiverId: string;
}

export interface Streams {
    user_id: string;
    stream: MediaStream;
}

export interface CustomEvent<T = any> {
    senderId: string;
    remoteUserId: string;
    event: string;
    data?: T;
}