import { Router } from 'express';
import { upload } from '../middleware/uploadM.ts';
import {
  addCategory,
  editCategory,
  deleteCategory,
  reorderCategory,
  addSkill,
  getAllSkills,
  editSkill,
  deleteSkill,
  reorderSkills
} from '../controller/skill.ts';

const router = Router();

// --- Category Routes ---
router.route('/category')
  .post(upload.fields([{ name: 'image1' }, { name: 'image2' }]), addCategory);

router.route('/category/reorder')
  .put(reorderCategory);

router.route('/category/:id')
  .put(upload.fields([{ name: 'image1' }, { name: 'image2' }]), editCategory)
  .delete(deleteCategory);

// --- Skill Routes ---
router.route('/')
  .post(addSkill)
  .get(getAllSkills);

router.route('/reorder')
  .put(reorderSkills);

router.route('/:id')
  .put(editSkill)
  .delete(deleteSkill);

export default router;