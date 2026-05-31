import { Router } from 'express';
import { createProfile, getProfile, editProfile, deleteProfile } from '../controller/user.ts';
import { upload } from '../middleware/uploadM.ts'; // Import your custom Multer configuration middleware

const router = Router();

router.route('/')
  .post(createProfile)
  .get(getProfile)
  .put(
    // Intercept with Multer to capture 'profileUser' and 'resume' file fields safely
    upload.fields([
      { name: 'profileUser', maxCount: 1 }, // 🌟 Completely renamed field key from 'avatar' to 'profileUser'
      { name: 'resume', maxCount: 1 }      // Captures the optional resume PDF document stream
    ]), 
    editProfile
  )
  .delete(deleteProfile);

export default router;