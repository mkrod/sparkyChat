// utility/session.js
import session from "express-session";
import { type RequestHandler } from "express";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const envar = process.env;

const sessionMiddleware: RequestHandler = session({
    name: "_chat_one_session",
    secret: "chat-your-secret-key-default", // must match in all uses
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: envar.MONGO_SESSION_URI || "mongodb://localhost:27017/chat_app_sessions",
    }),
    cookie: {
        secure: true,
        sameSite: "none"
    }
});

export default sessionMiddleware;