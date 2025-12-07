import { Router } from "express";
import { getUserSettings, updateUserSettings } from "../controllers/settings/settings.controller.js";
const router: Router = Router();


router.get("/", getUserSettings);
router.put("/update", updateUserSettings);

export default router;