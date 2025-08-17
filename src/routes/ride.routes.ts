// src/routes/ride.routes.ts
import { Router } from "express";
import * as rideCtrl from "../controllers/ride.controller";

const router = Router();

// POST   /api/rides
router.post("/", rideCtrl.createRide);

// GET    /api/rides
router.get("/", rideCtrl.listRides);

// GET    /api/rides/nearby?lat=...&lng=...&radius=...
router.get("/nearby", rideCtrl.nearbyRides);

// GET    /api/rides/:rideId
router.get("/:rideId", rideCtrl.getRide);

export default router;