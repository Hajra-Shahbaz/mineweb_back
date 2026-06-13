import express from 'express';
import { 
  createTask, 
  getAllTasks, 
  updateTask, 
  deleteTask 
} from '../controller/list.ts';

const router = express.Router();

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

export default router;