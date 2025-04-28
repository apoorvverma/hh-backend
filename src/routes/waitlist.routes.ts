import { Router } from 'express';
import { WaitlistController } from '../controllers/waitlist.controller';

const router = Router();
const waitlistController = new WaitlistController();

router.post('/join', waitlistController.joinWaitlist);

export default router;
