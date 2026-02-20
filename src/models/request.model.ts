import { db } from "../config/firebase";
import admin from "firebase-admin";

export type RequestStatus = "REQUESTED" | "CANCELLED" | "EXPIRED";

export interface RideRequestDoc {
  riderId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: RequestStatus;
  createdAt: admin.firestore.Timestamp;
}

const COLLECTION = "rideRequests";

export type CreateRequestInput = {
  riderId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
};

export async function createRequest(input: CreateRequestInput) {
  const ref = db.collection(COLLECTION).doc();
  const doc: RideRequestDoc = {
    ...input,
    status: "REQUESTED",
    createdAt: admin.firestore.Timestamp.now(),
  };
  await ref.set(doc);
  return { id: ref.id, ...doc };
}

export async function getRequest(id: string) {
  const snap = await db.collection(COLLECTION).doc(id).get();
  return snap.exists ? ({ id: snap.id, ...(snap.data() as RideRequestDoc) }) : null;
}

export const getRequestById = getRequest;

export async function cancelRequest(id: string, byRiderId: string) {
  const ref = db.collection(COLLECTION).doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new Error("Request not found");
    const cur = snap.data() as RideRequestDoc;
    if (cur.riderId !== byRiderId) throw new Error("Not your request");
    if (cur.status !== "REQUESTED") return;
    tx.update(ref, { status: "CANCELLED" });
  });
}

export async function listRequestsByRider(riderId: string, limit = 20) {
  const snap = await db
    .collection(COLLECTION)
    .where("riderId", "==", riderId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideRequestDoc) }));
}

export async function listAllRequests(limit = 50) {
  const snap = await db.collection(COLLECTION).limit(limit).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideRequestDoc) }));
}
