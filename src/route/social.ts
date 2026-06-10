import { Router } from 'express';
import { 
  addSocialLink, 
  getAllSocialLinks, 
  editSocialLink, 
  deleteSocialLink,
  reorderSocialLinks // 🌟 Imported the new reorder function
} from '../controller/sociol.ts';

const router = Router();

// Base collection routes
router.route('/')
  .post(addSocialLink)
  .get(getAllSocialLinks);

// 🌟 CRITICAL: Placed ABOVE /:id to prevent route precedence collision
router.route('/reorder')
  .put(reorderSocialLinks);

// Dynamic parameter routes
router.route('/:id')
  .put(editSocialLink)
  .delete(deleteSocialLink);

export default router;