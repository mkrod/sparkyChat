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