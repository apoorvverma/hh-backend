import { db } from '../config/firebase';
import { WaitlistEntry } from '../models/waitlist.model';

export class WaitlistService {
  private collection = 'waitlist';

  async addToWaitlist(email: string, firstName: string, lastName: string, city: string): Promise<string> {
    try {
      const entry: WaitlistEntry = {
        email: email.toLowerCase().trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        city: city.trim(),
        joinedAt: new Date()
      };

      // Check if email already exists
      const snapshot = await db.collection(this.collection)
        .where('email', '==', entry.email)
        .get();

      if (!snapshot.empty) {
        return 'Email already on waitlist';
      }

      // Add to waitlist
      const docRef = await db.collection(this.collection).add(entry);
      return docRef.id;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw new Error('Failed to add to waitlist');
    }
  }
}
