import { serverRequest } from ".."
import type { Response } from "../types";

export const sendMedia = async ({ formData }: { formData: FormData }): Promise<Response> => {
    const response = await serverRequest("post", "message/send/media", formData, "formdata");
    return response;
}