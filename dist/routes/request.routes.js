"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireUser_1 = require("../middleware/requireUser");
const request_controller_1 = require("../controllers/request.controller");
const r = (0, express_1.Router)();
// Rider creates a request
r.post("/", requireUser_1.requireUser, request_controller_1.createRideRequest);
// Rider lists their own requests
r.get("/", requireUser_1.requireUser, request_controller_1.listMyRequests);
// Rider cancels their request
r.post("/:id/cancel", requireUser_1.requireUser, request_controller_1.cancelRideRequest);
exports.default = r;
