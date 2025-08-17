"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.getUser = getUser;
exports.setAvailability = setAvailability;
exports.updateLocation = updateLocation;
exports.findNearbyUsers = findNearbyUsers;
const firebase_1 = require("../config/firebase");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const COLLECTION = "users";
async function createUser(userId, data) {
    await firebase_1.db.collection(COLLECTION).doc(userId).set(data, { merge: true });
}
async function getUser(userId) {
    const snap = await firebase_1.db.collection(COLLECTION).doc(userId).get();
    if (!snap.exists)
        return null;
    return { id: snap.id, ...snap.data() };
}
async function setAvailability(userId, isAvailable) {
    await firebase_1.db.collection(COLLECTION).doc(userId).set({ isAvailable }, { merge: true });
}
async function updateLocation(userId, lat, lng) {
    await firebase_1.db.collection(COLLECTION).doc(userId).set({
        location: { lat, lng, updatedAt: firebase_admin_1.default.firestore.Timestamp.now() },
    }, { merge: true });
}
/**
 * Naive nearby search (collection scan). OK for MVP; optimize later via geohash.
 * radiusMeters: straight-line radius; filter by role if provided.
 */
async function findNearbyUsers(center, radiusMeters, role) {
    const snap = await firebase_1.db.collection(COLLECTION).get();
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const out = [];
    snap.forEach((doc) => {
        const data = doc.data();
        if (role && data.role !== role)
            return;
        if (!data.location)
            return;
        const dLat = toRad(data.location.lat - center.lat);
        const dLon = toRad(data.location.lng - center.lng);
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(center.lat)) *
                Math.cos(toRad(data.location.lat)) *
                Math.sin(dLon / 2) ** 2;
        const dist = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        if (dist <= radiusMeters)
            out.push({ id: doc.id, ...data, distanceMeters: dist });
    });
    return out.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
