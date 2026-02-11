import { db } from "../config/firebase";
import admin from "firebase-admin";

export type RideStatus = "OPEN" | "REQUESTED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface RideDoc {
  driverId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: RideStatus;
  availableSeats?: number;
  // Fields for when a match happens
  requestId?: string;
  riderId?: string;
  fareQuoted?: number; 
  fareFinal?: number;
  routePolyline?: string;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  startedAt?: admin.firestore.Timestamp;
  completedAt?: admin.firestore.Timestamp;
}

const COLLECTION = "rides";

// For drivers posting a ride
export async function createRide(input: {
  driverId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  availableSeats?: number;
}) {
  const ref = db.collection(COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  const doc: RideDoc = {
    ...input,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

// Previously createOnAccept - kept for compatibility if needed, but createRide is more general
export async function createOnAccept(input: {
  requestId: string;
  riderId: string;
  driverId: string;
  fareQuoted?: number;
}) {
    // This function might need to be refactored to UPDATE an existing ride or create a new one from a request
    // For now, implementing as a new ride creation logic if that was the intent
    const ref = db.collection(COLLECTION).doc();
    const now = admin.firestore.Timestamp.now();
    // Use dummy locations if creating purely from acceptance (though ideally we'd have them)
    const doc: RideDoc = {
        driverId: input.driverId,
        requestId: input.requestId,
        riderId: input.riderId,
        fareQuoted: input.fareQuoted,
        origin: { lat: 0, lng: 0 }, // Placeholder
        destination: { lat: 0, lng: 0 }, // Placeholder
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
    };
    await ref.set(doc);
    return { id: ref.id, ...doc };
}

// Alias for consistency
export const getRideById = getRide;

// Alias for consistency
export const getRideById = getRide;

export async function getRide(id: string) {
  const snap = await db.collection(COLLECTION).doc(id).get();
  return snap.exists ? ({ id: snap.id, ...(snap.data() as RideDoc) }) : null;
}

export async function createRide(input: {
  driverId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  availableSeats?: number;
}) {
  const ref = db.collection(COLLECTION).doc();
  const now = admin.firestore.Timestamp.now();
  const doc: RideDoc = {
    ...input,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function createOnAccept(input: {
  requestId: string;
  riderId: string;
  driverId: string;
  fareQuoted?: number;
}) {
    const ref = db.collection(COLLECTION).doc();
    const now = admin.firestore.Timestamp.now();
    const doc: RideDoc = {
        driverId: input.driverId,
        requestId: input.requestId,
        riderId: input.riderId,
        fareQuoted: input.fareQuoted,
        origin: { lat: 0, lng: 0 },
        destination: { lat: 0, lng: 0 },
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
    };
    await ref.set(doc);
    return { id: ref.id, ...doc };
}

export async function listAllRides(limit = 50) {
    const snap = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideDoc) }));
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

export async function listAllRides(limit = 50) {
    const snap = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideDoc) }));
}
