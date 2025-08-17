"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireUser_1 = require("../middleware/requireUser");
const ride_controller_1 = require("../controllers/ride.controller");
const r = (0, express_1.Router)();
r.post("/accept/:id", requireUser_1.requireUser, ride_controller_1.driverAcceptRequest);
r.post("/:id/status", requireUser_1.requireUser, ride_controller_1.updateRideStatus);
r.get("/", requireUser_1.requireUser, ride_controller_1.listMyRides);
exports.default = r;
