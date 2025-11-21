import { Router } from "express";
import { getUserCallLogs, getUserCallLogsFiltered, getUserCallState } from "../controllers/call/call.controllers.js";
const router: Router = Router();

router.get("/state", getUserCallState);
router.get("/logs", getUserCallLogsFiltered);
router.get("/logs/unfiltered", getUserCallLogs);


export default router;