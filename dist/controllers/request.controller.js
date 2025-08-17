"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRideRequest = createRideRequest;
exports.cancelRideRequest = cancelRideRequest;
exports.listMyRequests = listMyRequests;
const request_model_1 = require("../models/request.model");
const socket_1 = require("../realtime/socket");
async function createRideRequest(req, res) {
    if (req.userRole !== "rider")
        return res.status(403).json({ error: "Only riders can create requests" });
    const { pickup, dropoff } = req.body;
    if (!pickup || !dropoff)
        return res.status(400).json({ error: "pickup and dropoff required" });
    const request = await (0, request_model_1.createRequest)({ riderId: req.userId, pickup, dropoff });
    (0, socket_1.notifyDriversOfRequest)({
        requestId: request.id,
        riderId: req.userId,
        pickup,
        dropoff,
    });
    res.status(201).json(request);
}
async function cancelRideRequest(req, res) {
    await (0, request_model_1.cancelRequest)(req.params.id, req.userId);
    res.json({ ok: true });
}
async function listMyRequests(req, res) {
    const items = await (0, request_model_1.listRequestsByRider)(req.userId, 20);
    res.json(items);
}
