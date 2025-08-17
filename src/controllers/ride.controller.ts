import { Response } from "express";
import { AuthedRequest } from "../middleware/requireUser";
import { getRequest } from "../models/request.model";
import { createOnAccept, listRidesByUser, updateStatus } from "../models/ride.model";
import { db } from "../config/firebase"; // for transaction
import { notifyRideUpdate } from "../realtime/socket";

export async function driverAcceptRequest(req: AuthedRequest, res: Response): Promise<void> {
  if (req.userRole !== "driver") {
    res.status(403).json({ error: "Only drivers can accept" });
    return;
  }

  const requestId = req.params.id;
  const requestRef = db.collection("rideRequests").doc(requestId);

  try {
    const rideTx = await db.runTransaction(async (tx) => {
      const snap = await tx.get(requestRef);
      if (!snap.exists) throw new Error("Request not found");
      const cur = snap.data() as any;
      if (cur.status !== "REQUESTED") throw new Error("Request no longer available");
      tx.update(requestRef, { status: "EXPIRED" });
      return { riderId: cur.riderId, requestId };
    });

    const created = await createOnAccept({
      requestId,
      riderId: rideTx.riderId,
      driverId: req.userId!,
    });

    // NEW: inform rider & driver
    notifyRideUpdate({
      rideId: created.id,
      riderId: created.riderId,
      driverId: created.driverId,
      status: "ACCEPTED",
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Error accepting ride request:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to accept ride request" });
  }
}

export async function updateRideStatus(req: AuthedRequest, res: Response) {
  const rideId = req.params.id;
  const { next } = req.body as { next: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" };
  if (!next) return res.status(400).json({ error: "next status required" });

  await updateStatus(rideId, next);

  // NEW: emit live status (you might fetch riderId/driverId by doc read if needed)
  // For a tiny perf hit, read minimal fields:
  const snap = await db.collection("rides").doc(rideId).get();
  if (snap.exists) {
    const d = snap.data() as any;
    notifyRideUpdate({
      rideId,
      riderId: d.riderId,
      driverId: d.driverId,
      status: next,
    });
  }

  res.json({ ok: true, next });
}

export async function listMyRides(req: AuthedRequest, res: Response) {
  const role = (req.query.role as "rider" | "driver") || req.userRole!;
  const items = await listRidesByUser(req.userId!, role, 20);
  res.json(items);
}
