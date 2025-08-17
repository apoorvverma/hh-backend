"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnAccept = createOnAccept;
exports.getRide = getRide;
exports.updateStatus = updateStatus;
exports.listRidesByUser = listRidesByUser;
const firebase_1 = require("../config/firebase");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const COLLECTION = "rides"; // if you want to keep old name, change to "driverRides"
async function createOnAccept(input) {
    const ref = firebase_1.db.collection(COLLECTION).doc();
    const now = firebase_admin_1.default.firestore.Timestamp.now();
    const doc = {
        ...input,
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
    };
    await ref.set(doc);
    return { id: ref.id, ...doc };
}
async function getRide(id) {
    const snap = await firebase_1.db.collection(COLLECTION).doc(id).get();
    return snap.exists ? ({ id: snap.id, ...snap.data() }) : null;
}
async function updateStatus(id, next) {
    const now = firebase_admin_1.default.firestore.Timestamp.now();
    const patch = { status: next, updatedAt: now };
    if (next === "IN_PROGRESS")
        patch.startedAt = now;
    if (next === "COMPLETED")
        patch.completedAt = now;
    await firebase_1.db.collection(COLLECTION).doc(id).set(patch, { merge: true });
}
async function listRidesByUser(userId, role, limit = 20) {
    const field = role === "rider" ? "riderId" : "driverId";
    const snap = await firebase_1.db
        .collection(COLLECTION)
        .where(field, "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
