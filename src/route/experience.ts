import { Router } from 'express';
import {
  addExperience,
  getAllExperience,
  editExperience,
  deleteExperience,
  reorderExperience
} from '../controller/experience.ts';
import { upload } from '../middleware/uploadM.ts'; // Import your custom Multer configuration middleware

const router = Router();

router.route('/')
  .post(upload.single('experiencePic'), addExperience) // Intercept single logo file on creation
  .get(getAllExperience);

// Register layout sequence update endpoint cleanly above parameter matches
router.route('/reorder')
  .put(reorderExperience);

router.route('/:id')
  .put(upload.single('experiencePic'), editExperience) // Intercept single logo file on update
  .delete(deleteExperience);

export default router;