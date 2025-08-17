// src/controllers/request.controller.ts
import { Request, Response } from "express";
import * as reqSvc from "../services/request.service";

export async function createRequest(req: Request, res: Response): Promise<void> {
  console.log("API Called: POST /api/requests");
  const { riderId, origin, destination } = req.body;
  if (
    !riderId ||
    !origin?.lat ||
    !origin?.lng ||
    !destination?.lat ||
    !destination?.lng
  ) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const requestId = await reqSvc.postRequest(riderId, origin, destination);
    res.status(201).json({ requestId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create request" });
  }
}

export async function getRequest(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/requests/${req.params.requestId}`);
  const { requestId } = req.params;
  const request = await reqSvc.fetchRequest(requestId);
  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(request);
}

export async function listRequests(_req: Request, res: Response): Promise<void> {
  console.log("API Called: GET /api/requests");
  const requests = await reqSvc.fetchAllRequests();
  res.json(requests);
}

export async function nearbyRequests(req: Request, res: Response): Promise<void> {
  console.log(`API Called: GET /api/requests/nearby?lat=${req.query.lat}&lng=${req.query.lng}&radius=${req.query.radius || 5000}`);
  const { lat, lng } = req.query;
  const radius = Number(req.query.radius) || 5000;
  if (!lat || !lng) {
    res.status(400).json({ error: "lat & lng query params required" });
    return;
  }
  const requests = await reqSvc.findRequestsNearby(
    Number(lat),
    Number(lng),
    radius
  );
  res.json(requests);
}
