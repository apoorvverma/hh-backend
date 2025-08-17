import { Router } from "express";
import * as userCtrl from "../controllers/user.controller";

const router = Router();

// POST /api/auth/register
router.post("/register", userCtrl.register);

export default router;
