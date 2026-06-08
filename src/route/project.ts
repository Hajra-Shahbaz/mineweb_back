import { Router } from 'express';
import { upload } from '../middleware/uploadM.ts';
import { 
  addProject, 
  getAllProjects, 
  editProject, 
  deleteProject,
  reorderProjects // <-- Import the reorder controller
} from '../controller/project.ts';

const router = Router();

// 1. Reorder endpoint added here
router.route('/reorder')
  .put(reorderProjects);

// 2. Base Collection Routes
router.route('/')
  .post(upload.single('imageUrl'), addProject)
  .get(getAllProjects);

// 3. Document Target Parameters
router.route('/:id')
  .put(upload.single('imageUrl'), editProject)
  .delete(deleteProject);

export default router;