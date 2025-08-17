import { db } from "../config/firebase";
import admin from "firebase-admin";

export type RideStatus = "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface RideDoc {
  requestId: string;
  riderId: string;
  driverId: string;
  status: RideStatus;
  fareQuoted?: number; // in minor units (e.g., cents)
  fareFinal?: number;
  routePolyline?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  startedAt?: admin.firestore.Timestamp;
  completedAt?: admin.firestore.Timestamp;
}

const COLLECTION = "rides"; // if you want to keep old name, change to "driverRides"

export async function createOnAccept(input: {
  requestId: string;
  riderId: string;
  driverId: string;
  fareQuoted?: number;
}) {
  const ref = db.collection(COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  const doc: RideDoc = {
    ...input,
    status: "ACCEPTED",
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function getRide(id: string) {
  const snap = await db.collection(COLLECTION).doc(id).get();
  return snap.exists ? ({ id: snap.id, ...(snap.data() as RideDoc) }) : null;
}

export async function updateStatus(id: string, next: RideStatus) {
  const now = admin.firestore.Timestamp.now();
  const patch: Partial<RideDoc> = { status: next, updatedAt: now };
  if (next === "IN_PROGRESS") patch.startedAt = now;
  if (next === "COMPLETED") patch.completedAt = now;
  await db.collection(COLLECTION).doc(id).set(patch, { merge: true });
}

export async function listRidesByUser(userId: string, role: "rider" | "driver", limit = 20) {
  const field = role === "rider" ? "riderId" : "driverId";
  const snap = await db
    .collection(COLLECTION)
    .where(field, "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideDoc) }));
}
