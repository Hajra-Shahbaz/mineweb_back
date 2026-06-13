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

export const getUserNav = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateNavConfig();
    
    if (req.query.visible === 'true') {
      const visibleItems = config.userNav ? config.userNav.filter((item: IUserNav) => item.isVisible) : [];
      res.status(200).json({ success: true, data: visibleItems });
      return;
    }

    res.status(200).json({ success: true, data: config.userNav || [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createUserNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, label, iconName, isVisible } = req.body;
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
    config.userNav.push({ id: cleanId, label, iconName, isVisible });
    
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
    const { id, label, iconName, isVisible } = req.body;
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