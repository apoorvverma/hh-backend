import { Request, Response } from 'express';
import { WaitlistService } from '../services/waitlist.service';

export class WaitlistController {
  private waitlistService = new WaitlistService();

  joinWaitlist = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error) {
      console.error('Waitlist join error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to join waitlist. Please try again later.' 
      });
    }
  };

  getWaitlistUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.waitlistService.getAllWaitlistUsers();
      res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('Error fetching waitlist users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch waitlist users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
