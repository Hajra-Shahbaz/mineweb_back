import { Router } from 'express';
import {
  addEducation,
  getAllEducation,
  editEducation,
  deleteEducation,
  reorderEducation
} from '../controller/education.ts';

const router = Router();

router.route('/')
  .post(addEducation)
  .get(getAllEducation);

// 🌟 Registered cleanly above the /:id parameter matching check block!
router.route('/reorder')
  .put(reorderEducation);

router.route('/:id')
  .put(editEducation)
  .delete(deleteEducation);

export default router;