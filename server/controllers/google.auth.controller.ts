import { type Request, type Response } from "express";

const googleAuthCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    // Here you would typically exchange the code for tokens and user info
    // For demonstration, we'll just send back the code
    res.json({ message: "Google Auth Callback received", code });
}



export { googleAuthCallback };