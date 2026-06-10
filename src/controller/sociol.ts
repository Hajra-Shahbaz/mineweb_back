import type { Request, Response } from 'express';
import mongoose from 'mongoose'; // 🌟 Added for explicit type casting in bulk updates
import { SocialM } from '../model/socialM.ts';

/**
 * @desc    Add a new social media link
 * @route   POST /api/social
 */
export const addSocialLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { platform, url, iconName } = req.body;

    if (!platform || !url) {
      res.status(400).json({ message: 'Platform name and URL are required.' });
      return;
    }

    const existingLink = await SocialM.findOne({ platform: platform.trim() });
    if (existingLink) {
      res.status(400).json({ message: 'This platform link already exists!' });
      return;
    }

    // 🌟 Calculate the next sequential position index
    const lastItem = await SocialM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    const newSocial = new SocialM({ 
      platform, 
      url, 
      iconName,
      order: nextOrderValue 
    });
    
    const savedSocial = await newSocial.save();
    res.status(201).json(savedSocial);
  } catch (error) {
    res.status(500).json({ message: 'Error adding social link', error });
  }
};

/**
 * @desc    Get all social links (Sorted by custom order sequence index)
 * @route   GET /api/social
 */
export const getAllSocialLinks = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 🌟 Returns social assets cleanly ordered according to your dashboard configuration
    const links = await SocialM.find().sort({ order: 1 });
    res.status(200).json(links);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving social links', error });
  }
};

/**
 * @desc    Update a specific platform string or URL dynamically
 * @route   PUT /api/social/:id
 */
export const editSocialLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedSocial = await SocialM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSocial) {
      res.status(404).json({ message: 'Social link profile not found with that ID' });
      return;
    }

    res.status(200).json(updatedSocial);
  } catch (error) {
    res.status(500).json({ message: 'Error updating social link', error });
  }
};

/**
 * @desc    Delete a social platform link
 * @route   DELETE /api/social/:id
 */
export const deleteSocialLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedSocial = await SocialM.findByIdAndDelete(id);

    if (!deletedSocial) {
      res.status(404).json({ message: 'Social link profile not found with that ID' });
      return;
    }

    res.status(200).json({ message: 'Social connection removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting social link', error });
  }
};

/**
 * @desc    Sync order sequence layout after a frontend drag-and-drop movement
 * @route   PUT /api/social/reorder
 */
export const reorderSocialLinks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body;

    if (!Array.isArray(totalSequence)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    // Map through sequence snapshot changes and perform an atomic execution block
    const bulkOperations = totalSequence.map((item: { id: string; order: number }) => {
      const isValidId = mongoose.Types.ObjectId.isValid(item.id);
      
      return {
        updateOne: {
          filter: { _id: isValidId ? new mongoose.Types.ObjectId(item.id) : item.id },
          update: { $set: { order: item.order } },
        },
      };
    });

    await SocialM.bulkWrite(bulkOperations);
    res.status(200).json({ message: 'Social structural layout reordered successfully!' });
  } catch (error) {
    console.error("Server-side social reorder failure details:", error);
    res.status(500).json({ message: 'Error reordering social links records', error });
  }
};