"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.driverAcceptRequest = driverAcceptRequest;
exports.updateRideStatus = updateRideStatus;
exports.listMyRides = listMyRides;
const ride_model_1 = require("../models/ride.model");
const firebase_1 = require("../config/firebase"); // for transaction
const socket_1 = require("../realtime/socket");
async function driverAcceptRequest(req, res) {
    if (req.userRole !== "driver") {
        res.status(403).json({ error: "Only drivers can accept" });
        return;
    }
    const requestId = req.params.id;
    const requestRef = firebase_1.db.collection("rideRequests").doc(requestId);
    try {
        const rideTx = await firebase_1.db.runTransaction(async (tx) => {
            const snap = await tx.get(requestRef);
            if (!snap.exists)
                throw new Error("Request not found");
            const cur = snap.data();
            if (cur.status !== "REQUESTED")
                throw new Error("Request no longer available");
            tx.update(requestRef, { status: "EXPIRED" });
            return { riderId: cur.riderId, requestId };
        });
        const created = await (0, ride_model_1.createOnAccept)({
            requestId,
            riderId: rideTx.riderId,
            driverId: req.userId,
        });
        // NEW: inform rider & driver
        (0, socket_1.notifyRideUpdate)({
            rideId: created.id,
            riderId: created.riderId,
            driverId: created.driverId,
            status: "ACCEPTED",
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error("Error accepting ride request:", error);
        res.status(400).json({ error: error instanceof Error ? error.message : "Failed to accept ride request" });
    }
}
async function updateRideStatus(req, res) {
    const rideId = req.params.id;
    const { next } = req.body;
    if (!next)
        return res.status(400).json({ error: "next status required" });
    await (0, ride_model_1.updateStatus)(rideId, next);
    // NEW: emit live status (you might fetch riderId/driverId by doc read if needed)
    // For a tiny perf hit, read minimal fields:
    const snap = await firebase_1.db.collection("rides").doc(rideId).get();
    if (snap.exists) {
        const d = snap.data();
        (0, socket_1.notifyRideUpdate)({
            rideId,
            riderId: d.riderId,
            driverId: d.driverId,
            status: next,
        });
    }
    res.json({ ok: true, next });
}
async function listMyRides(req, res) {
    const role = req.query.role || req.userRole;
    const items = await (0, ride_model_1.listRidesByUser)(req.userId, role, 20);
    res.json(items);
}
