
// @ts-nocheck

import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import { driverAcceptRequest, listMyRides, updateRideStatus } from "../controllers/ride.controller";

const r = Router();
r.post("/accept/:id", requireUser, driverAcceptRequest);
r.post("/:id/status", requireUser, updateRideStatus);
r.get("/", requireUser, listMyRides);

export default r;
