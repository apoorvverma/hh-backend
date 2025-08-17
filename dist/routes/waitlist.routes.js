"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const waitlist_controller_1 = require("../controllers/waitlist.controller");
const router = (0, express_1.Router)();
const waitlistController = new waitlist_controller_1.WaitlistController();
router.post('/join', waitlistController.joinWaitlist);
router.get('/get-waitlist-registrations', waitlistController.getWaitlistUsers);
exports.default = router;
