import { type Response, type Request } from "express";
import { customResponse } from "../utilities/index.js";




const checkSession = (req: Request, res: Response) => {
    const { user_id } = req.session;
    if(!user_id) return res.json(customResponse({message: "no session found", status: 404}));
    return res.json(customResponse({ message: "session active", status: 200 }));
}


const destroySession = (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json(customResponse({ message: "No session found", status: 404 }));
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.json(customResponse({ message: "Failed to destroy session", status: 500 }));
        }
        // Optionally clear cookie if you are using one
        res.clearCookie("_chat_one_session"); // replace "_chat_one_session" with your session cookie name
        return res.json(customResponse({ message: "Session destroyed successfully", status: 200 }));
    });
};

export { checkSession, destroySession }