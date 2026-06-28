import { Router } from 'express';
import { subscribe, getAllSubscribers } from '../controller/newsletterController.ts'; // Ensure this matches!

const router = Router();
router.post('/subscribe', subscribe);
router.get('/all', getAllSubscribers);

export default router; 