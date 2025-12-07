import { serverRequest } from "..";
import type { Response } from "../types";

export const SendMail = async (data: {type: string; data: any}): Promise<Response> => {
    const response: Response = await serverRequest("post", "mailer/send", data , "json");
    return response;
}