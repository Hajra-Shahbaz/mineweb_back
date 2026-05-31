import type { Request, Response } from 'express';
import { ExperienceM } from '../model/experienceM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

/**
 * @desc    Add a new work experience record + upload logo to S3
 * @route   POST /api/experience
 */
export const addExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const lastItem = await ExperienceM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    let experienceData = { 
      ...req.body, 
      order: nextOrderValue 
    };

    // Check if an image file was uploaded via Multer
    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'experiences');
      experienceData.companyLogoUrl = uploadedUrl;
    }

    const newExperience = new ExperienceM(experienceData);
    const savedExperience = await newExperience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    res.status(500).json({ message: 'Error adding experience record', error });
  }
};

/**
 * @desc    Get all experience records (Sorted by drag-and-drop alignment)
 * @route   GET /api/experience
 */
export const getAllExperience = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Returns data sorted exactly how you dragged it in your admin panel
    const experienceList = await ExperienceM.find().sort({ order: 1 });
    res.status(200).json(experienceList);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching experience records', error });
  }
};

/**
 * @desc    Edit an experience record + handle logo updates
 * @route   PUT /api/experience/:id
 */
export const editExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    let updateFields = { ...req.body };

    // If a new replacement image is sent, stream it to S3 and update the URL string field
    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'experiences');
      updateFields.companyLogoUrl = uploadedUrl;
    }

    const updatedExperience = await ExperienceM.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedExperience) {
      res.status(404).json({ message: 'Experience record not found' });
      return;
    }

    res.status(200).json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: 'Error updating experience record', error });
  }
};

/**
 * @desc    Delete an experience record
 * @route   DELETE /api/experience/:id
 */
export const deleteExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedExperience = await ExperienceM.findByIdAndDelete(req.params.id);
    if (!deletedExperience) {
      res.status(404).json({ message: 'Experience record not found' });
      return;
    }
    res.status(200).json({ message: 'Experience record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting experience record', error });
  }
};

/**
 * @desc    Sync order sequence layout after a frontend drag-and-drop movement
 * @route   PUT /api/experience/reorder
 */
export const reorderExperience = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body;

    if (!Array.isArray(totalSequence)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    const bulkOperations = totalSequence.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await ExperienceM.bulkWrite(bulkOperations);
    res.status(200).json({ message: 'Experience sequence alignment updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering experience records', error });
  }
};