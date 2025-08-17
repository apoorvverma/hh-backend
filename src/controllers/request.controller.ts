import { Response } from "express";
import { createRequest, cancelRequest, listRequestsByRider } from "../models/request.model";
import { AuthedRequest } from "../middleware/requireUser";
import { findNearbyUsers } from "../models/user.model";
import { notifyDriversOfRequest } from "../realtime/socket";

export async function createRideRequest(req: AuthedRequest, res: Response) {
  if (req.userRole !== "rider") return res.status(403).json({ error: "Only riders can create requests" });
  const { pickup, dropoff } = req.body as {
    pickup: { lat: number; lng: number; address?: string };
    dropoff: { lat: number; lng: number; address?: string };
  };
  if (!pickup || !dropoff) return res.status(400).json({ error: "pickup and dropoff required" });
  
  const request = await createRequest({ riderId: req.userId!, pickup, dropoff });
  
  notifyDriversOfRequest({
    requestId: request.id,
    riderId: req.userId!,
    pickup,
    dropoff,
  });

  res.status(201).json(request);
}

export async function cancelRideRequest(req: AuthedRequest, res: Response) {
  await cancelRequest(req.params.id, req.userId!);
  res.json({ ok: true });
}

export async function listMyRequests(req: AuthedRequest, res: Response) {
  const items = await listRequestsByRider(req.userId!, 20);
  res.json(items);
}
