import { Router } from 'express';
import { 
  addProject, 
  getAllProjects, 
  editProject, 
  deleteProject 
} from '../controller/project.ts';

const router = Router();

router.route('/')
  .post(addProject)
  .get(getAllProjects);

router.route('/:id')
  .put(editProject)
  .delete(deleteProject);

export default router;