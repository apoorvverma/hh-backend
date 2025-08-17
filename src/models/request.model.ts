// src/models/request.model.ts
import { db } from "../config/firebase";
import admin from "firebase-admin";

export interface RequestRecord {
  riderId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  createdAt: admin.firestore.Timestamp;
}

const COLLECTION = "rideRequests";

export async function createRequest(
  record: Omit<RequestRecord, "createdAt">
) {
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    ...record,
    createdAt: admin.firestore.Timestamp.now(),
  });
  return docRef.id;
}

export async function getRequestById(requestId: string) {
  const snap = await db.collection(COLLECTION).doc(requestId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as RequestRecord) };
}

export async function listAllRequests() {
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RequestRecord) }));
}
