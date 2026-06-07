import type { Request, Response } from 'express';
import { NavConfig } from '../model/navConfig.ts';

// 1. GET ALL ITEMS (For Admin Panel - Shows everything including hidden items)
export const getAllNavItems = async ( res: Response): Promise<void> => {
  try {
    const items = await NavConfig.find({});
    res.status(200).json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. GET VISIBLE ONLY (For Public Portfolio Layout Navigation)
export const getVisibleNavItems = async ( res: Response): Promise<void> => {
  try {
    const visibleItems = await NavConfig.find({ isVisible: true });
    res.status(200).json({ success: true, data: visibleItems });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. POST (Create a brand new navigational segment route)
export const createNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, label, iconName, isVisible } = req.body;

    const existingItem = await NavConfig.findOne({ id });
    if (existingItem) {
      res.status(400).json({ success: false, error: 'A nav item target with this ID already exists.' });
      return;
    }

    const newItem = new NavConfig({ id, label, iconName, isVisible });
    await newItem.save();

    res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. PUT (Update details, label, icon mappings, or structural visibility parameters)
export const updateNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { label, iconName, isVisible } = req.body;

    const updatedItem = await NavConfig.findOneAndUpdate(
      { id },
      { $set: { label, iconName, isVisible } },
      { new: true } // Return updated model instance context details
    );

    if (!updatedItem) {
      res.status(404).json({ success: false, error: 'Target navigational element node not located.' });
      return;
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. DELETE (Remove route entirely from the database cluster)
export const deleteNavItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedItem = await NavConfig.findOneAndDelete({ id });

    if (!deletedItem) {
      res.status(404).json({ success: false, error: 'Target element could not be found to remove.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Nav item purged completely from memory clusters.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};