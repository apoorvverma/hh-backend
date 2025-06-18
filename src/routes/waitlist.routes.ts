import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller';

const router = Router();
const waitlistController = new WaitlistController();

router.post('/join', waitlistController.joinWaitlist);
router.get('/get-waitlist-registrations', waitlistController.getWaitlistUsers);

export default router;
