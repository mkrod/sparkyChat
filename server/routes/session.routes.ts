import express, { type Router } from "express"
import { checkSession } from "../controllers/session.controllers.js";
const router :Router = express.Router();


router.get("/get", checkSession);


export default router;