import { Router } from 'express';
import { 
  addExperience, 
  getAllExperiences, 
  editExperience, 
  deleteExperience 
} from '../controller/experience.ts';

const router = Router();

router.route('/')
  .post(addExperience)
  .get(getAllExperiences);

router.route('/:id')
  .put(editExperience)
  .delete(deleteExperience);

export default router;