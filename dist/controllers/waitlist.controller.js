"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistController = void 0;
const waitlist_service_1 = require("../services/waitlist.service");
class WaitlistController {
    constructor() {
        this.waitlistService = new waitlist_service_1.WaitlistService();
        this.joinWaitlist = async (req, res) => {
            try {
                if (!req.body) {
                    res.status(400).json({ success: false, message: 'Request body is required' });
                    return;
                }
                console.log(req.body);
                const { email, firstName, lastName, city } = req.body;
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
                if (!firstName || typeof firstName !== 'string') {
                    res.status(400).json({ success: false, message: 'Valid first name/initial is required' });
                    return;
                }
                if (!lastName || typeof lastName !== 'string') {
                    res.status(400).json({ success: false, message: 'Valid last name/initial is required' });
                    return;
                }
                if (!city || typeof city !== 'string') {
                    res.status(400).json({ success: false, message: 'Valid city is required' });
                    return;
                }
                const result = await this.waitlistService.addToWaitlist(email, firstName, lastName, city);
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
