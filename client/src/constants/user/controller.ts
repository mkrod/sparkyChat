import { serverRequest } from "..";
import type { Response } from "../types";

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

export const fetchAllUsers = async (page : number, search_term: string): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/all", { page, search_term });
    return response;
}

export const addUserAsFriend = async (friend_id: string): Promise<Response> => {
    return await serverRequest("put", "user/add/friend", { friend_id }, "json") as Response;
}