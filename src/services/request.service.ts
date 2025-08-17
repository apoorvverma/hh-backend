// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as requestModel from "../models/request.model";
import { getDistance } from "../utils/geoutils";

export async function postRequest(
  riderId: string,
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  return requestModel.createRequest({ riderId, origin, destination });
}

export async function fetchRequest(requestId: string) {
  return requestModel.getRequestById(requestId);
}

export async function fetchAllRequests() {
  return requestModel.listAllRequests();
}

export async function findRequestsNearby(
  lat: number,
  lng: number,
  radiusMeters: number
) {
  const requests = await requestModel.listAllRequests();
  return requests.filter((r) =>
    getDistance(r.origin.lat, r.origin.lng, lat, lng) <= radiusMeters
  );
}
