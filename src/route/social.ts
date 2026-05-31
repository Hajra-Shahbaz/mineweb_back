import { Router } from 'express';
import { 
  addSocialLink, 
  getAllSocialLinks, 
  editSocialLink, 
  deleteSocialLink 
} from '../controller/sociol.ts';

const router = Router();

router.route('/')
  .post(addSocialLink)
  .get(getAllSocialLinks);

router.route('/:id')
  .put(editSocialLink)
  .delete(deleteSocialLink);

export default router;