import { Router } from 'express';
import waitlistRoutes from './waitlist.routes';
import userRoutes from "./user.routes";
import rideRoutes from './ride.routes';
import requestRoutes from './request.routes';
import matchRoutes from './match.routes';

const router = Router();

router.use('/api/waitlist', waitlistRoutes);
router.use("/api/auth", userRoutes);
router.use("/api/rides", rideRoutes);
router.use("/api/requests", requestRoutes);
router.use("/api/matches",  matchRoutes);

export default router;
