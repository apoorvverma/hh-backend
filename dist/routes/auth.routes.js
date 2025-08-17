"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const requireUser_1 = require("../middleware/requireUser");
const r = (0, express_1.Router)();
r.post("/login", auth_controller_1.login);
r.post("/me/availability", requireUser_1.requireUser, auth_controller_1.me_setAvailability);
r.post("/me/location", requireUser_1.requireUser, auth_controller_1.me_updateLocation);
exports.default = r;
