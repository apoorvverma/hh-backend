"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistController = void 0;
const waitlist_service_1 = require("../services/waitlist.service");
class WaitlistController {
    constructor() {
        this.waitlistService = new waitlist_service_1.WaitlistService();
        this.joinWaitlist = async (req, res) => {
            try {
                const { email } = req.body;
                // Validate email
                if (!email || typeof email !== 'string') {
                    res.status(400).json({ success: false, message: 'Valid email is required' });
                    return;
                }
                // Simple email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.status(400).json({ success: false, message: 'Invalid email format' });
                    return;
                }
                const result = await this.waitlistService.addToWaitlist(email);
                if (result === 'Email already on waitlist') {
                    res.status(200).json({
                        success: true,
                        message: 'You are already on our waitlist!'
                    });
                    return;
                }
                res.status(201).json({
                    success: true,
                    message: 'Successfully joined the waitlist!',
                    id: result
                });
            }
            catch (error) {
                console.error('Waitlist join error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to join waitlist. Please try again later.'
                });
            }
        };
    }
}
exports.WaitlistController = WaitlistController;
