import { serverRequest } from "..";
import type { Response } from "../types";

export const fetchUserData = async (): Promise<Response> => {
    const response: Response = await serverRequest("get", "user/get");
    return response;
}