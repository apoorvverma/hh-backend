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

  async getAllWaitlistUsers(): Promise<WaitlistEntry[]> {
    try {
      const snapshot = await db.collection(this.collection).orderBy('joinedAt', 'desc').get();
      const users: WaitlistEntry[] = [];
      
      snapshot.forEach((doc: any) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          city: userData.city,
          joinedAt: userData.joinedAt.toDate()
        } as WaitlistEntry);
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching waitlist users:', error);
      throw new Error('Failed to fetch waitlist users');
    }
  }
}
