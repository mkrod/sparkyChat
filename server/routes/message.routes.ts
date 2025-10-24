import express, { Router } from "express";
import { sendMedia } from "../controllers/messages/send.media.js";
import { upload } from "../utilities/multer/multer.config.js";
const router: Router = express.Router();


router.post("/send/media", upload("files", "array", "../../public/uploads"), sendMedia);

export default router;