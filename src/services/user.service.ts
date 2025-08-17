// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as userModel from "../models/user.model";

export async function registerUser(
  userId: string,
  displayName: string,
  role: "driver" | "rider"
) {
  // you could add extra business logic/validation here
  return userModel.createUser(userId, { displayName, role });
}

export async function fetchUser(userId: string) {
  return userModel.getUser(userId);
}

export async function findNearbyUsers(
  latitude: number,
  longitude: number,
  radiusInKm: number = 5, // Default 5km radius
  limit: number = 10
) {
  // Input validation
  if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInKm) || isNaN(limit)) {
    throw new Error("Invalid input parameters");
  }
  
  if (radiusInKm <= 0 || limit <= 0) {
    throw new Error("Radius and limit must be positive numbers");
  }
  
  return userModel.findNearbyUsers(
    { latitude, longitude },
    radiusInKm,
    limit
  );
}
