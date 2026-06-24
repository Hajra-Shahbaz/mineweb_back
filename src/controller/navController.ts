import type { Request, Response } from 'express';
import type { IAdminNav, IUserNav } from '../model/navConfig';
import { NavConfig } from '../model/navConfig';

// Helper function to get or initialize the single master navigation document
const getOrCreateNavConfig = async () => {
  let config = await NavConfig.findOne({});
  if (!config) {
    config = new NavConfig({ adminNav: [], userNav: [] });
    await config.save();
  }
  return config;
};

// ==========================================
// ADMIN NAVIGATION FUNCTIONS
// ==========================================

export const getAdminNav = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    res.status(200).json({ success: true, data: config.adminNav || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAdminNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, label, iconName, isWorking } = req.body;
    const config = await getOrCreateNavConfig();

    if (!id) {
      res.status(400).json({ success: false, error: 'ID field is required.' });
      return;
    }

    const cleanId = String(id).toLowerCase().trim();

    if (config.adminNav && config.adminNav.some((item: IAdminNav) => item.id === cleanId)) {
      res.status(400).json({ success: false, error: 'An admin nav item with this ID already exists.' });
      return;
    }

    if (!config.adminNav) config.adminNav = [];
    config.adminNav.push({ id: cleanId, label, iconName, isWorking });
    
    config.markModified('adminNav'); 
    await config.save();
    res.status(201).json({ success: true, data: config.adminNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const editAdminNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.targetId ? String(req.params.targetId).toLowerCase().trim() : '';
    const { id, label, iconName, isWorking } = req.body;
    const config = await getOrCreateNavConfig();

    if (!targetId) {
      res.status(400).json({ success: false, error: 'Target ID param is missing.' });
      return;
    }

    if (!config.adminNav) {
      res.status(404).json({ success: false, error: 'Admin navigation data structure empty.' });
      return;
    }

    const itemIndex = config.adminNav.findIndex((item: IAdminNav) => item.id === targetId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: 'Admin nav item not found.' });
      return;
    }

    const targetItem = config.adminNav[itemIndex];
    if (!targetItem) {
      res.status(404).json({ success: false, error: 'Target item reference lost.' });
      return;
    }

    if (id) {
      const cleanNewId = String(id).toLowerCase().trim();
      if (cleanNewId !== targetId) {
        if (config.adminNav.some((item: IAdminNav) => item.id === cleanNewId)) {
          res.status(400).json({ success: false, error: 'The new ID is already taken by another item.' });
          return;
        }
        targetItem.id = cleanNewId;
      }
    }

    if (label !== undefined) targetItem.label = label;
    if (iconName !== undefined) targetItem.iconName = iconName;
    if (isWorking !== undefined) targetItem.isWorking = isWorking;

    config.markModified('adminNav');
    await config.save();
    res.status(200).json({ success: true, data: targetItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAdminNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? String(req.params.id).toLowerCase().trim() : '';
    const config = await getOrCreateNavConfig();

    if (!id) {
      res.status(400).json({ success: false, error: 'ID param is missing.' });
      return;
    }

    if (!config.adminNav) {
      res.status(404).json({ success: false, error: 'Admin navigation stack not allocated.' });
      return;
    }

    const initialLength = config.adminNav.length;
    config.adminNav = config.adminNav.filter((item: IAdminNav) => item.id !== id);

    if (config.adminNav.length === initialLength) {
      res.status(404).json({ success: false, error: 'Admin nav item not found to delete.' });
      return;
    }

    config.markModified('adminNav'); 
    await config.save();
    res.status(200).json({ success: true, message: 'Admin nav item deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderAdminNav = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sortedItems } = req.body; 
    
    if (!Array.isArray(sortedItems)) {
      res.status(400).json({ success: false, error: "Invalid payload format. Expected sortedItems array." });
      return;
    }

    const config = await getOrCreateNavConfig();
    config.adminNav = sortedItems;
    
    config.markModified('adminNav'); 
    await config.save();

    res.status(200).json({ success: true, data: config.adminNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// USER / DISPLAY NAVIGATION FUNCTIONS
// ==========================================

export const getUserNav = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    
    if (_req.query.visible === 'true') {
      const visibleItems = config.userNav ? config.userNav.filter((item: IUserNav) => item.isVisible) : [];
      res.status(200).json({ success: true, data: visibleItems });
      return;
    }

    // Filter for page routes if requested
    if (_req.query.pages === 'true') {
      const pageItems = config.userNav ? config.userNav.filter((item: IUserNav) => item.isPage === true) : [];
      res.status(200).json({ success: true, data: pageItems });
      return;
    }

    res.status(200).json({ success: true, data: config.userNav || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createUserNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, label, iconName, isVisible, route, isPage } = req.body;
    const config = await getOrCreateNavConfig();

    if (!id) {
      res.status(400).json({ success: false, error: 'ID field is required.' });
      return;
    }

    const cleanId = String(id).toLowerCase().trim();

    if (config.userNav && config.userNav.some((item: IUserNav) => item.id === cleanId)) {
      res.status(400).json({ success: false, error: 'A user nav item with this ID already exists.' });
      return;
    }

    if (!config.userNav) config.userNav = [];
    config.userNav.push({ 
      id: cleanId, 
      label, 
      iconName, 
      isVisible: isVisible !== undefined ? isVisible : true,
      route: route || undefined,
      isPage: isPage !== undefined ? isPage : false
    });
    
    config.markModified('userNav');
    await config.save();
    res.status(201).json({ success: true, data: config.userNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const editUserNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.targetId ? String(req.params.targetId).toLowerCase().trim() : '';
    const { id, label, iconName, isVisible, route, isPage } = req.body;
    const config = await getOrCreateNavConfig();

    if (!targetId) {
      res.status(400).json({ success: false, error: 'Target ID param is missing.' });
      return;
    }

    if (!config.userNav) {
      res.status(404).json({ success: false, error: 'User navigation stack not allocated.' });
      return;
    }

    const itemIndex = config.userNav.findIndex((item: IUserNav) => item.id === targetId);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: 'User nav item not found.' });
      return;
    }

    const targetItem = config.userNav[itemIndex];
    if (!targetItem) {
      res.status(404).json({ success: false, error: 'Target item reference lost.' });
      return;
    }

    if (id) {
      const cleanNewId = String(id).toLowerCase().trim();
      if (cleanNewId !== targetId) {
        if (config.userNav.some((item: IUserNav) => item.id === cleanNewId)) {
          res.status(400).json({ success: false, error: 'The new ID is already taken by another item.' });
          return;
        }
        targetItem.id = cleanNewId;
      }
    }

    if (label !== undefined) targetItem.label = label;
    if (iconName !== undefined) targetItem.iconName = iconName;
    if (isVisible !== undefined) targetItem.isVisible = isVisible;
    if (route !== undefined) targetItem.route = route;
    if (isPage !== undefined) targetItem.isPage = isPage;

    config.markModified('userNav');
    await config.save();
    res.status(200).json({ success: true, data: targetItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUserNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? String(req.params.id).toLowerCase().trim() : '';
    const config = await getOrCreateNavConfig();

    if (!id) {
      res.status(400).json({ success: false, error: 'ID param is missing.' });
      return;
    }

    if (!config.userNav) {
      res.status(404).json({ success: false, error: 'User navigation matrix missing.' });
      return;
    }

    const initialLength = config.userNav.length;
    config.userNav = config.userNav.filter((item: IUserNav) => item.id !== id);

    if (config.userNav.length === initialLength) {
      res.status(404).json({ success: false, error: 'User nav item not found to delete.' });
      return;
    }

    config.markModified('userNav');
    await config.save();
    res.status(200).json({ success: true, message: 'User nav item deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const reorderUserNav = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sortedItems } = req.body;

    if (!Array.isArray(sortedItems)) {
      res.status(400).json({ success: false, error: 'sortedItems property must be a valid array.' });
      return;
    }

    const config = await getOrCreateNavConfig();
    config.userNav = sortedItems;

    config.markModified('userNav');
    await config.save();

    res.status(200).json({ success: true, data: config.userNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// NEW: PAGE NAVIGATION FUNCTIONS
// ==========================================

export const getPageNavItems = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    const pageItems = config.userNav ? config.userNav.filter((item: IUserNav) => item.isPage === true && item.isVisible === true) : [];
    res.status(200).json({ success: true, data: pageItems });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPageNavItemByRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const route = req.params.route ? String(req.params.route).trim() : '';
    const config = await getOrCreateNavConfig();

    if (!route) {
      res.status(400).json({ success: false, error: 'Route parameter is required.' });
      return;
    }

    const pageItem = config.userNav.find((item: IUserNav) => 
      item.route === route && item.isPage === true
    );

    if (!pageItem) {
      res.status(404).json({ success: false, error: 'Page navigation item not found.' });
      return;
    }

    res.status(200).json({ success: true, data: pageItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createPageNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, label, iconName, isVisible, route } = req.body;
    const config = await getOrCreateNavConfig();

    if (!id || !route) {
      res.status(400).json({ success: false, error: 'ID and route fields are required.' });
      return;
    }

    const cleanId = String(id).toLowerCase().trim();
    const cleanRoute = String(route).trim().toLowerCase();

    // Check for duplicate ID
    if (config.userNav && config.userNav.some((item: IUserNav) => item.id === cleanId)) {
      res.status(400).json({ success: false, error: 'A user nav item with this ID already exists.' });
      return;
    }

    // Check for duplicate route
    if (config.userNav && config.userNav.some((item: IUserNav) => item.route === cleanRoute)) {
      res.status(400).json({ success: false, error: 'A page with this route already exists.' });
      return;
    }

    if (!config.userNav) config.userNav = [];
    config.userNav.push({ 
      id: cleanId, 
      label, 
      iconName, 
      isVisible: isVisible !== undefined ? isVisible : true,
      route: cleanRoute,
      isPage: true
    });
    
    config.markModified('userNav');
    await config.save();
    res.status(201).json({ success: true, data: config.userNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const editPageNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.targetId ? String(req.params.targetId).toLowerCase().trim() : '';
    const { id, label, iconName, isVisible, route } = req.body;
    const config = await getOrCreateNavConfig();

    if (!targetId) {
      res.status(400).json({ success: false, error: 'Target ID param is missing.' });
      return;
    }

    if (!config.userNav) {
      res.status(404).json({ success: false, error: 'User navigation stack not allocated.' });
      return;
    }

    const itemIndex = config.userNav.findIndex((item: IUserNav) => item.id === targetId && item.isPage === true);
    if (itemIndex === -1) {
      res.status(404).json({ success: false, error: 'Page nav item not found.' });
      return;
    }

    const targetItem = config.userNav[itemIndex];
    if (!targetItem) {
      res.status(404).json({ success: false, error: 'Target item reference lost.' });
      return;
    }

    if (id) {
      const cleanNewId = String(id).toLowerCase().trim();
      if (cleanNewId !== targetId) {
        if (config.userNav.some((item: IUserNav) => item.id === cleanNewId)) {
          res.status(400).json({ success: false, error: 'The new ID is already taken by another item.' });
          return;
        }
        targetItem.id = cleanNewId;
      }
    }

    if (route) {
      const cleanRoute = String(route).trim().toLowerCase();
      if (cleanRoute !== targetItem.route) {
        if (config.userNav.some((item: IUserNav) => item.route === cleanRoute)) {
          res.status(400).json({ success: false, error: 'This route is already taken by another page.' });
          return;
        }
        targetItem.route = cleanRoute;
      }
    }

    if (label !== undefined) targetItem.label = label;
    if (iconName !== undefined) targetItem.iconName = iconName;
    if (isVisible !== undefined) targetItem.isVisible = isVisible;

    config.markModified('userNav');
    await config.save();
    res.status(200).json({ success: true, data: targetItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePageNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id ? String(req.params.id).toLowerCase().trim() : '';
    const config = await getOrCreateNavConfig();

    if (!id) {
      res.status(400).json({ success: false, error: 'ID param is missing.' });
      return;
    }

    if (!config.userNav) {
      res.status(404).json({ success: false, error: 'User navigation matrix missing.' });
      return;
    }

    const initialLength = config.userNav.length;
    config.userNav = config.userNav.filter((item: IUserNav) => !(item.id === id && item.isPage === true));

    if (config.userNav.length === initialLength) {
      res.status(404).json({ success: false, error: 'Page nav item not found to delete.' });
      return;
    }

    config.markModified('userNav');
    await config.save();
    res.status(200).json({ success: true, message: 'Page nav item deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPageNavChildren = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentId = req.params.parentId ? String(req.params.parentId).toLowerCase().trim() : '';
    const config = await getOrCreateNavConfig();

    if (!parentId) {
      res.status(400).json({ success: false, error: 'Parent ID parameter is required.' });
      return;
    }

    const parentItem = config.userNav.find((item: IUserNav) => item.id === parentId && item.isPage === true);
    
    if (!parentItem) {
      res.status(404).json({ success: false, error: 'Page navigation item not found.' });
      return;
    }

    const children = parentItem.children || [];
    res.status(200).json({ success: true, data: children });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// COMPOSITE NAVIGATION FUNCTIONS
// ==========================================

export const getFullNavigation = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    
    // Get all navigation items with their hierarchy
    const fullNav = {
      adminNav: config.adminNav || [],
      userNav: config.userNav || [],
      pageNav: config.userNav ? config.userNav.filter((item: IUserNav) => item.isPage === true) : []
    };
    
    res.status(200).json({ success: true, data: fullNav });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNavigationStructure = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    
    // Build a structured navigation tree
    const navStructure = {
      admin: config.adminNav || [],
      user: config.userNav || [],
      pages: config.userNav ? config.userNav.filter((item: IUserNav) => item.isPage === true) : []
    };
    
    res.status(200).json({ success: true, data: navStructure });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};