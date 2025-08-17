// src/services/match.service.ts
import * as rideModel from "../models/ride.model";
import * as reqModel  from "../models/request.model";
import { findRidesNearby }    from "./ride.service";
import { findRequestsNearby } from "./request.service";

const DEFAULT_RADIUS = 5000;

export async function getDriverMatchesForRider(requestId: string, radius = DEFAULT_RADIUS) {
  const req = await reqModel.getRequestById(requestId);
  if (!req) return null;
  // find driver rides near rider’s origin
  return findRidesNearby(req.origin.lat, req.origin.lng, radius);
}

export async function getRiderMatchesForDriver(rideId: string, radius = DEFAULT_RADIUS) {
  const ride = await rideModel.getRideById(rideId);
  if (!ride) return null;
  // find ride requests near driver’s origin
  return findRequestsNearby(ride.origin.lat, ride.origin.lng, radius);
}
