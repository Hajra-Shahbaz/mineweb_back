import { Router } from 'express';
import {upload }from '../middleware/uploadM.ts'; // Adjust this import to point to your existing multer config file
import {
  addEducation,
  getAllEducation,
  editEducation,
  deleteEducation,
  reorderEducation
} from '../controller/education.ts';

const router = Router();

router.route('/')
  .post(upload.single('educationLogo'), addEducation)
  .get(getAllEducation);

// 🌟 Registered cleanly above the /:id parameter matching check block!
router.route('/reorder')
  .put(reorderEducation);

router.route('/:id')
  .put(upload.single('educationLogo'), editEducation)
  .delete(deleteEducation);

export default router;