import { Router } from 'express';
import { 
  addService, 
  getAllServices, 
  editService, 
  deleteService 
} from '../controller/service.ts';

const router = Router();

router.route('/')
  .post(addService)
  .get(getAllServices);

router.route('/:id')
  .put(editService)
  .delete(deleteService);

export default router;