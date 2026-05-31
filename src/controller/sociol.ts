import type { Request, Response } from 'express';
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

    const newSocial = new SocialM({ platform, url, iconName });
    const savedSocial = await newSocial.save();
    res.status(201).json(savedSocial);
  } catch (error) {
    res.status(500).json({ message: 'Error adding social link', error });
  }
};

/**
 * @desc    Get all social links
 * @route   GET /api/social
 */
export const getAllSocialLinks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const links = await SocialM.find();
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