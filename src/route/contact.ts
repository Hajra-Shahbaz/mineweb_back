import { Router } from 'express';
import { 
  submitMessage, 
  getInbox, 
  toggleReadStatus, 
  deleteMessage 
} from '../controller/contact.ts';

const router = Router();

router.route('/')
  .post(submitMessage) // Public contact form hook
  .get(getInbox);      // Secure admin feed access

router.route('/:id')
  .put(toggleReadStatus)
  .delete(deleteMessage);

export default router;