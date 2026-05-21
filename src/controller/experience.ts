import type { Request, Response } from 'express';
import { ExperienceM } from '../model/experienceM.ts';

/**
 * @desc    Add a new work experience entry
 * @route   POST /api/experience
 */
export const addExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const newExperience = new ExperienceM(req.body);
    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    res.status(500).json({ message: 'Error adding experience entry', error });
  }
};

/**
 * @desc    Get all work experience items (sorted newest first)
 * @route   GET /api/experience
 */
export const getAllExperiences = async (_req: Request, res: Response): Promise<void> => {
  try {
    const history = await ExperienceM.find().sort({ startDate: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching experiences', error });
  }
};

/**
 * @desc    Edit a specific part of an experience dynamically
 * @route   PUT /api/experience/:id
 */
export const editExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedExperience = await ExperienceM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedExperience) {
      res.status(404).json({ message: 'Experience entry not found' });
      return;
    }

    res.status(200).json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: 'Error updating experience data', error });
  }
};

/**
 * @desc    Remove an experience card
 * @route   DELETE /api/experience/:id
 */
export const deleteExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedExperience = await ExperienceM.findByIdAndDelete(id);

    if (!deletedExperience) {
      res.status(404).json({ message: 'Experience entry not found' });
      return;
    }

    res.status(200).json({ message: 'Experience item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience item', error });
  }
};