import { Router } from 'express';
import { getAllNavItems, getVisibleNavItems, createNavItem, updateNavItem, deleteNavItem } from '../controller/navController.ts';

const router = Router();

// Public route for your client portfolio layout
router.get('/portfolio-nav', getVisibleNavItems);

// Protected admin routing clusters
router.get('/admin-nav',  getAllNavItems);
router.post('/admin-nav',  createNavItem);
router.put('/admin-nav/:id', updateNavItem);
router.delete('/admin-nav/:id', deleteNavItem);

export default router;