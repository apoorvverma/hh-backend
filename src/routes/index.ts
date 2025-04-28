import { Router } from 'express';
import waitlistRoutes from './waitlist.routes';

const router = Router();

router.use('/waitlist', waitlistRoutes);

export default router;
