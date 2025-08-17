import { Request, Response } from "express";
import { createUser, setAvailability, updateLocation } from "../models/user.model";

export async function login(req: Request, res: Response) {
  const { displayName, role } = req.body as { displayName: string; role: "driver" | "rider" };
  if (!displayName || !role) return res.status(400).json({ error: "displayName and role are required" });

  // Create a new user id (doc id) so you can copy/paste it easily into Postman env vars.
  const userId = Math.random().toString(36).slice(2, 10);
  const userPayload: any = { displayName, role };
  if (role === "driver") userPayload.isAvailable = true;
  await createUser(userId, userPayload);

  res.json({ userId, role });
}

export async function me_setAvailability(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  const { isAvailable } = req.body as { isAvailable: boolean };
  await setAvailability(userId, !!isAvailable);
  res.json({ ok: true });
}

export async function me_updateLocation(req: Request, res: Response) {
  const userId = req.headers["x-user-id"] as string;
  const { lat, lng } = req.body as { lat: number; lng: number };
  if (typeof lat !== "number" || typeof lng !== "number") return res.status(400).json({ error: "lat/lng required" });
  await updateLocation(userId, lat, lng);
  res.json({ ok: true });
}
