import type { Request, Response } from 'express';
import { EducationM } from '../model/educationM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

/**
 * @desc    Add a new education instance + upload institutional logo to S3
 * @route   POST /api/education
 */
export const addEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    const lastItem = await EducationM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    let educationData = {
      ...req.body,
      order: nextOrderValue
    };

    // Check if an image file was uploaded via Multer
    if (req.file) {
      // Stream directly to your specific S3 bucket bucket sub-folder structure
      const uploadedUrl = await uploadFileToS3(req.file, 'educations');
      educationData.institutionLogoUrl = uploadedUrl;
    }

    const newEducation = new EducationM(educationData);
    const savedEducation = await newEducation.save();
    res.status(201).json(savedEducation);
  } catch (error) {
    res.status(500).json({ message: 'Error adding education record', error });
  }
};

/**
 * @desc    Edit details of a specific education record + handle logo updates
 * @route   PUT /api/education/:id
 */
export const editEducation = async (req: Request, res: Response): Promise<void> => {
  try {
    let updateFields = { ...req.body };

    // If a new replacement image is sent, stream it to S3 and update the URL string field
    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'educations');
      updateFields.institutionLogoUrl = uploadedUrl;
    }

    const updatedEducation = await EducationM.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true } // Ensures the Mongoose schema validates input changes
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