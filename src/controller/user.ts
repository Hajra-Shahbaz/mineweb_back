import type { Request, Response } from 'express';
import { UserM } from '../model/userM.ts';

/**
 * @desc    Create/Post profile data (Initial setup)
 * @route   POST /api/user
 */
export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, title, aboutText, subText } = req.body;

    const existingProfile = await UserM.findOne();
    if (existingProfile) {
      res.status(400).json({ message: 'Profile data already exists. Use the edit route instead.' });
      return;
    }

    const newProfile = new UserM({ name, title, aboutText, subText });
    const savedProfile = await newProfile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile data', error });
  }
};

/**
 * @desc    Get profile data
 * @route   GET /api/user
 */
export const getProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    const profile = await UserM.findOne();
    if (!profile) {
      res.status(404).json({ message: 'No profile data found.' });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile data', error });
  }
};

/**
 * @desc    Edit/Update specific profile parts dynamically (No ID needed)
 * @route   PUT /api/user
 */
export const editProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // findOneAndUpdate with an empty query {} automatically selects the first/only document
    const updatedProfile = await UserM.findOneAndUpdate(
      {},
      { $set: req.body }, 
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      res.status(404).json({ message: 'No profile data found to update. Create it first.' });
      return;
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile data', error });
  }
};

/**
 * @desc    Delete profile data (No ID needed)
 * @route   DELETE /api/user
 */
export const deleteProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Automatically finds and drops the single profile document
    const deletedProfile = await UserM.findOneAndDelete({});

    if (!deletedProfile) {
      res.status(404).json({ message: 'No profile data found to delete.' });
      return;
    }

    res.status(200).json({ message: 'Profile data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile data', error });
  }
};