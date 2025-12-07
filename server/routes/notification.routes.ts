import express, { type Router } from "express"
import { readAllUserNotification } from "../controllers/notification/notification.controller.js";
const router: Router = express.Router();

router.put("/read_all", readAllUserNotification);

export default router;