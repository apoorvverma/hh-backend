"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistService = void 0;
const firebase_1 = require("../config/firebase");
class WaitlistService {
    constructor() {
        this.collection = 'waitlist';
    }
    async addToWaitlist(email, firstName, lastName, city) {
        try {
            const entry = {
                email: email.toLowerCase().trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                city: city.trim(),
                joinedAt: new Date()
            };
            // Check if email already exists
            const snapshot = await firebase_1.db.collection(this.collection)
                .where('email', '==', entry.email)
                .get();
            if (!snapshot.empty) {
                return 'Email already on waitlist';
            }
            // Add to waitlist
            const docRef = await firebase_1.db.collection(this.collection).add(entry);
            return docRef.id;
        }
        catch (error) {
            console.error('Error adding to waitlist:', error);
            throw new Error('Failed to add to waitlist');
        }
    }
}
exports.WaitlistService = WaitlistService;
