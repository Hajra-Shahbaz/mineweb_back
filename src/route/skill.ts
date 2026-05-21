import { Router } from 'express';
import { 
  addSkill, 
  getAllSkills, 
  editSkill, 
  deleteSkill 
} from '../controller/skill.ts';

const router = Router();

router.route('/')
  .post(addSkill)
  .get(getAllSkills);

router.route('/:id')
  .put(editSkill)
  .delete(deleteSkill);

export default router;