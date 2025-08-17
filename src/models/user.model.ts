import { db } from "../config/firebase";

export interface Location {
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

export interface UserRecord {
  displayName: string;
  role: "driver" | "rider";
  location?: Location;
}

const COLLECTION = "users";

export async function createUser(
  userId: string,
  record: UserRecord
): Promise<void> {
  await db.collection(COLLECTION).doc(userId).set(record);
}

export async function getUser(
  userId: string
): Promise<(UserRecord & { id: string }) | null> {
  const snap = await db.collection(COLLECTION).doc(userId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as UserRecord) };
}

export async function findNearbyUsers(
  center: { latitude: number; longitude: number },
  radiusInKm: number,
  limit: number = 10
): Promise<Array<UserRecord & { id: string; distance: number }>> {
  // This is a simplified implementation that does a full collection scan
  // For production, consider using Geohashing or a dedicated geospatial database
  const usersSnapshot = await db.collection(COLLECTION).get();
  
  const users: Array<UserRecord & { id: string; distance: number }> = [];
  
  usersSnapshot.forEach(doc => {
    const userData = doc.data() as UserRecord;
    if (userData.location) {
      const distance = calculateDistance(
        center.latitude,
        center.longitude,
        userData.location.latitude,
        userData.location.longitude
      );
      
      if (distance <= radiusInKm) {
        users.push({
          id: doc.id,
          ...userData,
          distance
        });
      }
    }
  });
  
  // Sort by distance and limit results
  return users
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
