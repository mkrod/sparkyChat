import { type Request, type Response } from "express";
import type { GoogleIdTokenPayload, GoogleTokenResponse } from "../utilities/types/google.js";
import { getTokenWithCode } from "../utilities/google/code_exchange.js";
import { jwtDecode } from "jwt-decode";
import { sendError } from "../utilities/index.js";
import { usersModel } from "../utilities/db/model/users.js";
import dotenv from "dotenv";
dotenv.config();




const googleAuthCallback = async (req: Request, res: Response) => {

    try {
        const code = req.query.code as string;
        // Here you would typically exchange the code for tokens and user info
        // For demonstration, we'll just send back the code
        const response: GoogleTokenResponse = await getTokenWithCode(code);
        const decoded: GoogleIdTokenPayload = jwtDecode(response.id_token);
        console.log("Google user decoded:", decoded);

        if(!decoded.email_verified) return sendError(res, "Email address not verified");

        const startSession = (user_id: string) => {
            req.session.user_id = user_id;
        };

        ////////// values ////////
        const name = {
            first: decoded.given_name,
            last: decoded.family_name,
        };
        
        const { email, picture, sub: user_id } = decoded;
        const username: string = (email.split("@")[0] || email).toLowerCase().trim();
        const created_at: Date = new Date();
        const auth_method = "google";

        //////// check if user exist in db
        const dbResponse = await usersModel.findOne({ email });
        if (!dbResponse) {
            await usersModel.insertOne({ user_id, username, email, name, picture, created_at, last_login: created_at, auth_method });
            console.log("New user created:", email);
        }
        
        startSession(user_id);
        return res.redirect(process.env.CLIENT_URL || "");
        
        
    }catch(err: any) {
        console.error("Error Authenticating with Google:", err.stack || err);
        sendError(res, "Error Authenticating with google");
    }
}



export { googleAuthCallback };