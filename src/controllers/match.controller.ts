// src/controllers/match.controller.ts
import { Request, Response } from "express";
import * as matchSvc from "../services/match.service";

export async function riderMatches(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/matches/rider/${req.params.requestId}`);
  const { requestId } = req.params;
  const matches = await matchSvc.getDriverMatchesForRider(requestId);
  if (matches === null) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(matches);
}

export async function driverMatches(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/matches/driver/${req.params.rideId}`);
  const { rideId } = req.params;
  const matches = await matchSvc.getRiderMatchesForDriver(rideId);
  if (matches === null) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  res.json(matches);
}
