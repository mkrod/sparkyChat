import express, { type Router } from "express";
import { getUserData } from "../controllers/user/user.controllers.js";
const router: Router = express.Router();


router.get("/get", getUserData);


export default router;
