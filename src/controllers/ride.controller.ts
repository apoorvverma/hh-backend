// src/controllers/ride.controller.ts
import { Request, Response } from "express";
import * as rideService from "../services/ride.service";

export async function createRide(req: Request, res: Response): Promise<void> {
  console.log("API Called: POST /api/rides");
  const { driverId, origin, destination } = req.body;
  if (
    !driverId ||
    !origin?.lat ||
    !origin?.lng ||
    !destination?.lat ||
    !destination?.lng
  ) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const rideId = await rideService.postRide(driverId, origin, destination);
    res.status(201).json({ rideId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create ride" });
  }
}

export async function getRide(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/rides/${req.params.rideId}`);
  const { rideId } = req.params;
  const ride = await rideService.fetchRide(rideId);
  if (!ride) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }
  res.json(ride);
}

export async function listRides(req: Request, res: Response): Promise<void> {
  console.log("API Called: GET /api/rides");
  const rides = await rideService.fetchAllRides();
  res.json(rides);
}

export async function nearbyRides(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/rides/nearby?lat=${req.query.lat}&lng=${req.query.lng}&radius=${req.query.radius || 5000}`);
  const { lat, lng } = req.query;
  const radius = Number(req.query.radius) || 5000;
  if (!lat || !lng) {
    res.status(400).json({ error: "lat & lng query params required" });
    return;
  }
  const rides = await rideService.findRidesNearby(
    Number(lat),
    Number(lng),
    radius
  );
  res.json(rides);
}
