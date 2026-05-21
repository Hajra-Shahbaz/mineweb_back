import { Router } from 'express';
import { 
  createProfile, 
  getProfile, 
  editProfile, 
  deleteProfile 
} from '../controller/user.ts';

const router = Router();

// Base path: /api/user
router.route('/')
  .post(createProfile)   // Initial profile setup
  .get(getProfile)       // Fetch profile data
  .put(editProfile)      // Edit specific parts dynamically (No ID parameter needed!)
  .delete(deleteProfile); // Remove profile configuration

export default router;