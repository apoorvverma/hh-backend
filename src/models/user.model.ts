import { db } from "../config/firebase";
import admin from "firebase-admin";

export type Role = "driver" | "rider";

export interface UserDoc {
  displayName: string;
  role: Role;
  isAvailable?: boolean; // drivers toggle this
  rating?: number;
  vehicle?: { make?: string; model?: string; plate?: string };
  location?: { lat: number; lng: number; updatedAt: admin.firestore.Timestamp };
}

const COLLECTION = "users";

export async function createUser(userId: string, data: UserDoc): Promise<void> {
  await db.collection(COLLECTION).doc(userId).set(data, { merge: true });
}

export async function getUser(userId: string): Promise<(UserDoc & { id: string }) | null> {
  const snap = await db.collection(COLLECTION).doc(userId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as UserDoc) };
}

export async function setAvailability(userId: string, isAvailable: boolean) {
  await db.collection(COLLECTION).doc(userId).set({ isAvailable }, { merge: true });
}

export async function updateLocation(userId: string, lat: number, lng: number) {
  await db.collection(COLLECTION).doc(userId).set(
    {
      location: { lat, lng, updatedAt: admin.firestore.Timestamp.now() },
    },
    { merge: true }
  );
}

/**
 * Naive nearby search (collection scan). OK for MVP; optimize later via geohash.
 * radiusMeters: straight-line radius; filter by role if provided.
 */
export async function findNearbyUsers(
  center: { lat: number; lng: number },
  radiusMeters: number,
  role?: Role
): Promise<Array<UserDoc & { id: string; distanceMeters: number }>> {
  const snap = await db.collection(COLLECTION).get();
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;

  const out: Array<UserDoc & { id: string; distanceMeters: number }> = [];
  snap.forEach((doc) => {
    const data = doc.data() as UserDoc;
    if (role && data.role !== role) return;
    if (!data.location) return;
    const dLat = toRad(data.location.lat - center.lat);
    const dLon = toRad(data.location.lng - center.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(center.lat)) *
        Math.cos(toRad(data.location.lat)) *
        Math.sin(dLon / 2) ** 2;
    const dist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist <= radiusMeters) out.push({ id: doc.id, ...data, distanceMeters: dist });
  });

  return out.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
