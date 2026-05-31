import type { Request, Response } from 'express';
import { ServiceM } from '../model/serviceM.ts';

/**
 * @desc    Add a new professional service offering
 * @route   POST /api/service
 */
export const addService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, iconName, imageUrl } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required fields.' });
      return;
    }

    const existingService = await ServiceM.findOne({ title: title.trim() });
    if (existingService) {
      res.status(400).json({ message: 'A service with this title already exists!' });
      return;
    }

    const newService = new ServiceM({ title, description, iconName, imageUrl });
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: 'Error adding service offering', error });
  }
};

/**
 * @desc    Get all listed services
 * @route   GET /api/service
 */
export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await ServiceM.find().sort({ createdAt: 1 }); // Sort oldest to newest
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving services', error });
  }
};

/**
 * @desc    Edit specific sections of a service dynamically
 * @route   PUT /api/service/:id
 */
export const editService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedService = await ServiceM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      res.status(404).json({ message: 'Service offering not found' });
      return;
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service details', error });
  }
};

/**
 * @desc    Delete a service card
 * @route   DELETE /api/service/:id
 */
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedService = await ServiceM.findByIdAndDelete(id);

    if (!deletedService) {
      res.status(404).json({ message: 'Service offering not found' });
      return;
    }

    res.status(200).json({ message: 'Service offering removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing service offering', error });
  }
};