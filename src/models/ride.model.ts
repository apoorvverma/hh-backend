// src/models/ride.model.ts
import { db } from "../config/firebase";
import admin from "firebase-admin";

export interface RideRecord {
  driverId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  createdAt: admin.firestore.Timestamp;
}

const COLLECTION = "driverRides";

export async function createRide(record: Omit<RideRecord, "createdAt">) {
  const docRef = db.collection(COLLECTION).doc();
  await docRef.set({
    ...record,
    createdAt: admin.firestore.Timestamp.now(),
  });
  return docRef.id;
}

export async function getRideById(rideId: string) {
  const snap = await db.collection(COLLECTION).doc(rideId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as RideRecord) };
}

export async function listAllRides() {
  const snap = await db.collection(COLLECTION).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as RideRecord) }));
}
