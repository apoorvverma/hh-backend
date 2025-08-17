// src/services/ride.service.ts
import * as rideModel from "../models/ride.model";
import { getDistance } from "../utils/geoutils";

export async function postRide(
  driverId: string,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  return rideModel.createRide({ driverId, origin, destination });
}

export async function fetchRide(rideId: string) {
  return rideModel.getRideById(rideId);
}

export async function fetchAllRides() {
  return rideModel.listAllRides();
}

/**
 * Very simple “find nearby” for MVP:
 * scan all rides, filter by distance between their origin & given point
 */
export async function findRidesNearby(
  lat: number,
  lng: number,
  radiusMeters: number
) {
  const rides = await rideModel.listAllRides();
  return rides.filter((r) =>
    getDistance(r.origin.lat, r.origin.lng, lat, lng) <= radiusMeters
  );
}
