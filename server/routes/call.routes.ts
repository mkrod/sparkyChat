import { Router } from "express";
import { getUserCallLogs, getUserCallState } from "../controllers/call/call.controllers.js";
const router: Router = Router();

router.get("/state", getUserCallState);
router.get("/logs", getUserCallLogs);


export default router;