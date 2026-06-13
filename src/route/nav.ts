import { Router } from 'express';
import {
  getAdminNav,
  createAdminNavItem,
  editAdminNavItem,
  deleteAdminNavItem,
  reorderAdminNav,
  getUserNav,
  createUserNavItem,
  editUserNavItem,
  deleteUserNavItem,
  reorderUserNav
} from '../controller/navController';

const router = Router();

// ==========================================
// ADMIN NAVIGATION ROUTING
// ==========================================
router.get('/admin', getAdminNav);              // GET /api/nav/admin
router.post('/admin', createAdminNavItem);        // POST /api/nav/admin
router.put('/admin/:targetId', editAdminNavItem); // PUT /api/nav/admin/:targetId
router.delete('/admin/:id', deleteAdminNavItem);   // DELETE /api/nav/admin/:id
router.patch('/admin/reorder', reorderAdminNav);   // PATCH /api/nav/admin/reorder

// ==========================================
// USER / DISPLAY NAVIGATION ROUTING
// ==========================================
router.get('/user', getUserNav);                // GET /api/nav/user
router.post('/user', createUserNavItem);          // POST /api/nav/user
router.put('/user/:targetId', editUserNavItem);   // PUT /api/nav/user/:targetId
router.delete('/user/:id', deleteUserNavItem);     // DELETE /api/nav/user/:id
router.patch('/user/reorder', reorderUserNav);     // PATCH /api/nav/user/reorder

export default router;