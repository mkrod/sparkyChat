import express, { Router } from "express";
import { bypassMediaWithCors } from "../controllers/proxy.controller.js";
const router: Router = express.Router();

router.get("/", bypassMediaWithCors);


export default router;