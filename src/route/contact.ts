import { Router } from 'express';
import { 
  submitMessage, 
  getInbox, 
  updateMessageDetails, // Updated name
  toggleArchiveStatus,  // Added new archive handler
  deleteMessage 
} from '../controller/contact.ts';

const router = Router();

// Base collection routes
router.route('/')
  .post(submitMessage) // Public contact form submission (with auto-priority detection)
  .get(getInbox);      // Dashboard feed access (supports filtering queries)

// Document-specific routes by ID
router.route('/:id')
  .put(updateMessageDetails) // Updates read status, updates admin notes, or manual priority overrides
  .delete(deleteMessage);    // Permanently purges a message from the DB

// Route for toggling archive status without deleting data
router.patch('/:id/archive', toggleArchiveStatus);

export default router;