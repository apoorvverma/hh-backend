// @ts-nocheck

import { Router } from "express";
import { requireUser } from "../middleware/requireUser";
import {
  createRideRequest,
  listMyRequests,
  cancelRideRequest,
} from "../controllers/request.controller";

const r = Router();

// Rider creates a request
r.post("/", requireUser, createRideRequest);

// Rider lists their own requests
r.get("/", requireUser, listMyRequests);

// Rider cancels their request
r.post("/:id/cancel", requireUser, cancelRideRequest);

export default r;
