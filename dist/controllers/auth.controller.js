"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me_setAvailability = me_setAvailability;
exports.me_updateLocation = me_updateLocation;
const user_model_1 = require("../models/user.model");
async function login(req, res) {
    const { displayName, role } = req.body;
    if (!displayName || !role)
        return res.status(400).json({ error: "displayName and role are required" });
    // Create a new user id (doc id) so you can copy/paste it easily into Postman env vars.
    const userId = Math.random().toString(36).slice(2, 10);
    const userPayload = { displayName, role };
    if (role === "driver")
        userPayload.isAvailable = true;
    await (0, user_model_1.createUser)(userId, userPayload);
    res.json({ userId, role });
}
async function me_setAvailability(req, res) {
    const userId = req.headers["x-user-id"];
    const { isAvailable } = req.body;
    await (0, user_model_1.setAvailability)(userId, !!isAvailable);
    res.json({ ok: true });
}
async function me_updateLocation(req, res) {
    const userId = req.headers["x-user-id"];
    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number")
        return res.status(400).json({ error: "lat/lng required" });
    await (0, user_model_1.updateLocation)(userId, lat, lng);
    res.json({ ok: true });
}
