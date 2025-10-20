import express, { type Router } from "express";
import { getUserData } from "../controllers/user/user.controllers.js";
import { getMutualChat, getUserMessageList } from "../controllers/messages/message.controller.js";
import { getAllUsersPresence } from "../controllers/presence/presence.controller.js";
const router: Router = express.Router();


router.get("/get", getUserData);
router.get("/messages/list", getUserMessageList);
router.post("/messages/chat", getMutualChat);
router.get("/presence", getAllUsersPresence);


export default router;
