// src/routes/match.routes.ts
import { Router } from "express";
import * as matchCtrl from "../controllers/match.controller";

const router = Router();

// GET  /api/matches/rider/:requestId
router.get("/rider/:requestId", matchCtrl.riderMatches);

// GET  /api/matches/driver/:rideId
router.get("/driver/:rideId", matchCtrl.driverMatches);

export default router;
