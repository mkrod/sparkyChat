import { serverRequest } from "..";
import type { EditUser, Response } from "../types";

export const fetchUserData = async (): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/get");
    return response;
}

export const fetchMessageList = async (): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/messages/list");
    return response;
};


export const fetchUsersPresence = async (): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/presence");
    return response;
}

export const fetchCurrentChatMessages = async (chatId: string): Promise<Response> => {
    const response: Response = await serverRequest("post", `user/messages/chat`, { chatId }, "json");
    return response;
}

export const getTypingList = async (): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/typing/get");
    return response;
}

export const fetchAllUsers = async (page: number, search_term: string): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/all", { page, search_term });
    return response;
}


// 📩 Send a friend request
export const sendFriendRequest = async (friend_id: string): Promise<Response> => {
    return await serverRequest("put", "user/send/request", { friend_id }, "json") as Response;
};

// ❌ Cancel a sent friend request
export const cancelSentRequest = async (friend_id: string): Promise<Response> => {
    return await serverRequest("delete", "user/cencel/user/request", { friend_id }, "json") as Response;
};

// ✅ Accept a friend request
export const acceptUserRequest = async (friend_id: string): Promise<Response> => {
    return await serverRequest("put", "user/accept/user/request", { friend_id }, "json") as Response;
};

// 🚫 Decline a friend request
export const declineUserRequest = async (friend_id: string): Promise<Response> => {
    return await serverRequest("delete", "user/decline/user/request", { friend_id }, "json") as Response;
};

// 📥 Fetch all friend requests (received)
export const fetchAllUserRequests = async (page: number, search_term: string): Promise<Response> => {
    return await serverRequest("get", "user/requests", { page, search_term }) as Response;
};


// 👥 Fetch all user friends
export const fetchUserFriends = async (page: number, search_term: string): Promise<Response> => {
    return await serverRequest("get", "user/friends", { page, search_term }) as Response;
};

export const removeUserAsFriend = async (friend_id: string) => {
    return await serverRequest("delete", "user/remove/friend", { friend_id }, "json") as Response;
}

export const updateReadReciept = async (newReceipt: boolean): Promise<Response> => {
    return await serverRequest("put", "user/update/read_receipt", { newReceipt }, "json") as Response<boolean>;
}

export const updateUserDetails = async (update: EditUser): Promise<Response> => {
    return await serverRequest("put", "user/update", { update }, "json") as Response;
}


export const updateUserDp = async (formData: FormData): Promise<Response> => {
    return await serverRequest("put", "user/update/picture", formData, "formdata") as Response;
}

export const fetchUserNotifications = async (): Promise<Response> => {
    return await serverRequest("get", "user/notification");
}

export const markAllNoteRead = async (): Promise<Response> => {
    return await serverRequest("put", "notification/read_all");
}

export const fetchSettings = async (): Promise<Response> => {
    return await serverRequest("get", "settings/");
}

export const updateSettings = async (setting: Record<string, any>): Promise<Response> => {
    return await serverRequest("put", "settings/update", setting, "json");
}