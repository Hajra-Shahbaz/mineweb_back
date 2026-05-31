import type { Request, Response } from 'express';
import { EducationM } from '../model/educationM.ts';

/**
 * @desc    Add a new education instance
 * @route   POST /api/education
 */
export const addEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamically find the highest current order value to append the new entry at the bottom
    const lastItem = await EducationM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    const newEducation = new EducationM({
      ...req.body,
      order: nextOrderValue
    });

    const savedEducation = await newEducation.save();
    res.status(201).json(savedEducation);
  } catch (error) {
    res.status(500).json({ message: 'Error adding education record', error });
  }
};

/**
 * @desc    Get all education records (Sorted by drag-and-drop alignment)
 * @route   GET /api/education
 */
export const getAllEducation = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Crucial: Sorts fields ascending based on your custom visual alignment layout
    const educationList = await EducationM.find().sort({ order: 1 });
    res.status(200).json(educationList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching education details', error });
  }
};

/**
 * @desc    Edit details of a specific education record
 * @route   PUT /api/education/:id
 */
export const editEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedEducation = await EducationM.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedEducation) {
      res.status(404).json({ message: 'Education record not found' });
      return;
    }

    res.status(200).json(updatedEducation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating education data', error });
  }
};

/**
 * @desc    Delete an education record
 * @route   DELETE /api/education/:id
 */
export const deleteEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedEducation = await EducationM.findByIdAndDelete(req.params.id);
    if (!deletedEducation) {
      res.status(404).json({ message: 'Education data target not found to remove' });
      return;
    }
    res.status(200).json({ message: 'Education record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting education entry', error });
  }
};

/**
 * @desc    Update the sequence layout order after a frontend drag-and-drop movement
 * @route   PUT /api/education/reorder
 */
export const reorderEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    // Expects payload structure array: [{ id: "id1", order: 0 }, { id: "id2", order: 1 }]
    const { totalSequence } = req.body;

    if (!Array.isArray(totalSequence)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    // High performance bulk data operations
    const bulkOperations = totalSequence.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await EducationM.bulkWrite(bulkOperations);

    res.status(200).json({ message: 'Education sequence alignment locked in!' });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing layout sequencing mapping arrays', error });
  }
};