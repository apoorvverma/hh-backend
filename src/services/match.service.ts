import * as rideModel from "../models/ride.model";
import * as reqModel  from "../models/request.model";
import { findRidesNearby } from "./ride.service";

const DEFAULT_RADIUS = 5000;

export async function getDriverMatchesForRider(requestId: string, radius = DEFAULT_RADIUS) {
  const req = await reqModel.getRequestById(requestId);
  if (!req || !req.origin) return null;
  // find driver rides near rider’s origin
  return findRidesNearby(req.origin.lat, req.origin.lng, radius);
}

export async function getRiderMatchesForDriver(rideId: string, radius = DEFAULT_RADIUS) {
  const ride = await rideModel.getRideById(rideId);
  if (!ride || !ride.origin) return null;
  
  // NOTE: You need to implement findRequestsNearby in request.service.ts 
  // or do it here similar to findRidesNearby
  const allRequests = await reqModel.listAllRequests();
  /*
  return allRequests.filter(r => 
      r.origin && getDistance(r.origin.lat, r.origin.lng, ride.origin.lat, ride.origin.lng) <= radius
  );
  */
  return []; // Placeholder until request service is ready
}
