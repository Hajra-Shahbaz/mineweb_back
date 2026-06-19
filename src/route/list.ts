import express from 'express';
import { 
  createTask, 
  getAllTasks, 
  updateTask, 
  deleteTask 
} from '../controller/list.ts';

const router = express.Router();

// Base routes for handling tasks collection
router.route('/')
  .get(getAllTasks)
  .post(createTask);

// Target routes handling specific individual task instances by ID
router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

export default router;