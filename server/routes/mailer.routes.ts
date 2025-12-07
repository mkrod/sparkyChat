import { Router } from "express";
import { sendMail } from "../controllers/mail/mailer.controller.js";
const router: Router = Router();

router.post("/send", sendMail);


export default router;