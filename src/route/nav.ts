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
  reorderUserNav,
  getPageNavItems,
  getPageNavItemByRoute,
  createPageNavItem,
  editPageNavItem,
  deletePageNavItem,
  getPageNavChildren,
  getFullNavigation,
  getNavigationStructure
} from '../controller/navController.ts';

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

// ==========================================
// PAGE NAVIGATION ROUTING
// ==========================================
router.get('/pages', getPageNavItems);           // GET /api/nav/pages
router.get('/pages/route/:route', getPageNavItemByRoute); // GET /api/nav/pages/route/:route
router.post('/pages', createPageNavItem);         // POST /api/nav/pages
router.put('/pages/:targetId', editPageNavItem);   // PUT /api/nav/pages/:targetId
router.delete('/pages/:id', deletePageNavItem);     // DELETE /api/nav/pages/:id
router.get('/pages/:parentId/children', getPageNavChildren); // GET /api/nav/pages/:parentId/children

// ==========================================
// COMPOSITE NAVIGATION ROUTING
// ==========================================
router.get('/full', getFullNavigation);          // GET /api/nav/full
router.get('/structure', getNavigationStructure); // GET /api/nav/structure

export default router; 