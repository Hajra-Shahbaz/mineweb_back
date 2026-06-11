import { Router } from 'express';
import {
  getAdminNav,
  createAdminNavItem,
  editAdminNavItem,
  deleteAdminNavItem,
  getUserNav,
  createUserNavItem,
  editUserNavItem,
  deleteUserNavItem
} from '../controller/navController.ts';

const router = Router();

// ==========================================
// ADMIN NAVIGATION ROUTING (isWorking state)
// ==========================================
router.get('/admin/nav', getAdminNav);                  // Get all Admin links
router.post('/admin/nav', createAdminNavItem);            // Create new Admin link
router.put('/admin/nav/:targetId', editAdminNavItem);     // Edit Admin link (modifies ID/state)
router.delete('/admin/nav/:id', deleteAdminNavItem);      // Delete Admin link

// ==========================================
// USER / DISPLAY NAVIGATION ROUTING (isVisible state)
// ==========================================
router.get('/user/nav', getUserNav);                    // Get all User links (pass ?visible=true for public portfolio layout)
router.post('/user/nav', createUserNavItem);              // Create new User link
router.put('/user/nav/:targetId', editUserNavItem);       // Edit User link (modifies ID/state)
router.delete('/user/nav/:id', deleteUserNavItem);        // Delete User link

export default router;