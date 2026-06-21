import { Router } from 'express';
import { upload } from '../middleware/uploadM.ts';
import { 
  addProject, 
  getAllProjects, 
  getProjectById,
  editProject, 
  deleteProject,
  reorderProjects,
  toggleProjectVisibility,
  getVisibleProjects,
  bulkDeleteProjects
} from '../controller/project.ts';

const router = Router();

// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise, Express will interpret "reorder" as an ID parameter

// 1. Reorder endpoint (specific route)
router.put('/reorder', reorderProjects);

// 2. Get visible projects (specific route)
router.get('/visible', getVisibleProjects);

// 3. Toggle visibility (specific route with action)
router.patch('/:id/toggle-visibility', toggleProjectVisibility);

// 4. Bulk delete (specific route)
router.delete('/bulk', bulkDeleteProjects);

// 5. Base Collection Routes
router.route('/')
  .post(upload.single('imageUrl'), addProject)
  .get(getAllProjects);

// 6. Individual Project Routes (parameterized - MUST be last)
router.route('/:id')
  .get(getProjectById)
  .put(upload.single('imageUrl'), editProject)
  .delete(deleteProject);

export default router;