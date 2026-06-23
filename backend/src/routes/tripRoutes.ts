import { Router } from 'express';
import {
  generateNewTrip,
  fetchUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
} from '../controllers/tripController';
import authMiddleware from '../middleware/auth';

const router = Router();

// Secure all trip routes using authMiddleware
router.use(authMiddleware);

router.post('/', generateNewTrip);
router.get('/', fetchUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/regenerate-day', regenerateDay);

export default router;
