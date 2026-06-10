import { Router } from 'express';
import { 
  addSkill, 
  getAllSkills, 
  editSkill, 
  deleteSkill,
  reorderSkills
} from '../controller/skill.ts';

const router = Router();

router.route('/')
  .post(addSkill)
  .get(getAllSkills);

// 🌟 Registered cleanly above the /:id parameter matching check block!
router.route('/reorder')
  .put(reorderSkills);

router.route('/:id')
  .put(editSkill)
  .delete(deleteSkill);

export default router;