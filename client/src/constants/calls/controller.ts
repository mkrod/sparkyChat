import { serverRequest } from "..";
import type { CallLog, CallState, Response } from "../types";


export const fetchUserCallState = async (): Promise<Response> => {
    const response = await serverRequest("get", "call/state") as Response<CallState>;
    return response;
}

export const fetchUserCallLogs = async () => {
    const response = await serverRequest("get", "call/logs") as Response<CallLog[]>;
    return response
}