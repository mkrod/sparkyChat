import express, { type Router } from "express";
import { getAllUsers, getUserData } from "../controllers/user/user.controllers.js";
import { getMutualChat, getUserMessageList } from "../controllers/messages/message.controller.js";
import { getAllUsersPresence } from "../controllers/presence/presence.controller.js";
import { acceptUserRequest, cancelSentRequest, declineUserRequest, fetchAllUserRequests, fetchUserFriends, removeUserAsFriend, sendFriendRequest } from "../controllers/friends/friends.controller.js";
const router: Router = express.Router();

router.get("/all", getAllUsers)
router.get("/get", getUserData);
router.get("/messages/list", getUserMessageList);
router.post("/messages/chat", getMutualChat);
router.get("/presence", getAllUsersPresence);


router.put("/send/request", sendFriendRequest);
router.delete("/cencel/user/request", cancelSentRequest);
router.put("/accept/user/request", acceptUserRequest);
router.delete("/decline/user/request", declineUserRequest);

router.get("/requests", fetchAllUserRequests);
router.get("/friends", fetchUserFriends);

router.delete("/remove/friend", removeUserAsFriend);


export default router;
