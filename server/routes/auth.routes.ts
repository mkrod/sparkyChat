import express, { type Router } from 'express';
import { googleAuthCallback } from '../controllers/google.auth.controller.js';
const router: Router = express.Router();


router.get("/google/callback", googleAuthCallback);

export default router;