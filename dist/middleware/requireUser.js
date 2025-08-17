"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = requireUser;
const user_model_1 = require("../models/user.model");
async function requireUser(req, res, next) {
    try {
        const userId = req.headers["x-user-id"] || "";
        if (!userId) {
            res.status(401).json({ error: "Missing x-user-id header" });
            return; // <- stop here
        }
        const user = await (0, user_model_1.getUser)(userId);
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return; // <- stop here
        }
        req.userId = user.id;
        req.userRole = user.role;
        next();
    }
    catch (error) {
        next(error);
    }
}
