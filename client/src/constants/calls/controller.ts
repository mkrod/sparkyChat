import { serverRequest } from "..";
import type { AllCallLogsType, CallListTab, CallLog, CallState, Response } from "../types";


export const fetchUserCallState = async (): Promise<Response> => {
    const response = await serverRequest("get", "call/state") as Response<CallState>;
    return response;
}

export const fetchUserCallLogs = async (page: number, filter: CallListTab["code"]) => {
    const response = await serverRequest("get", "call/logs", {page, filter}) as Response<AllCallLogsType>;
    return response
}


export const fetchUserParallelCallLogs = async () => {
    const response = await serverRequest("get", "call/logs/unfiltered") as Response<CallLog[]>;
    return response
}
