import { Router } from 'express';
import { upload } from '../middleware/uploadM.ts'; 
import {
  addCategory,
  getAllData,
  editCategory,
  deleteCategory,
  reorderCategories,
  addSkillToCategory,
  editSkill,
  deleteSkill,
  reorderSkillsInCategory
} from '../controller/skill.ts';

const router = Router();

// --- Category Routes ---
router.route('/')
  .post(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), addCategory)
  .get(getAllData);

router.route('/reorder')
  .put(reorderCategories);

router.route('/:id')
  .put(upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), editCategory)
  .delete(deleteCategory);

// --- Skill Routes (Nested) ---
// Add a skill to a specific category
router.route('/:categoryId/skill')
  .post(addSkillToCategory);

// Reorder skills within a specific category
router.route('/:categoryId/reorder-skills')
  .put(reorderSkillsInCategory);

// Edit or Delete a specific skill within a category
router.route('/:categoryId/skill/:skillId')
  .put(editSkill)
  .delete(deleteSkill);

export default router;