import type { Request, Response } from 'express';
import { ProjectM } from '../model/projectM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

/**
 * @desc    Add a new project + auto-calculate order sequence
 * @route   POST /api/project
 */
export const addProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.title) {
      const existingProject = await ProjectM.findOne({ title: req.body.title.trim() });
      if (existingProject) {
        res.status(400).json({ message: 'A project with this title already exists.' });
        return;
      }
    }

    // Dynamic sequencing: find the current highest position value
    const lastItem = await ProjectM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    let projectData = { 
      ...req.body,
      order: nextOrderValue 
    };

    if (typeof projectData.techStack === 'string') {
      try {
        projectData.techStack = JSON.parse(projectData.techStack);
      } catch {
        projectData.techStack = projectData.techStack.split(',').map((s: string) => s.trim());
      }
    }

    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'projects');
      projectData.imageUrl = uploadedUrl;
    }

    const newProject = new ProjectM(projectData);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);

  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate error: A project with this title already exists.' });
      return;
    }
    res.status(500).json({ message: 'Error adding project', error });
  }
};

/**
 * @desc    Get all projects (Sorted by drag-and-drop layout order)
 * @route   GET /api/project
 */
export const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Sorted exactly by your manual administrative alignment sequence
    const projects = await ProjectM.find().sort({ order: 1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

/**
 * @desc    Edit a specific project dynamically
 * @route   PUT /api/project/:id
 */
export const editProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let updateFields = { ...req.body };

    if (updateFields.title) {
      // Fixed with an explicit type cast to solve the query signature verification issue
      const duplicateCheck = await ProjectM.findOne({ 
        title: updateFields.title.trim(), 
        _id: { $ne: id as any } 
      });
      if (duplicateCheck) {
        res.status(400).json({ message: 'Another project already uses this title.' });
        return;
      }
    }

    if (typeof updateFields.techStack === 'string') {
      try {
        updateFields.techStack = JSON.parse(updateFields.techStack);
      } catch {
        updateFields.techStack = updateFields.techStack.split(',').map((s: string) => s.trim());
      }
    }

    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'projects');
      updateFields.imageUrl = uploadedUrl;
    }

    const updatedProject = await ProjectM.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate error: A project with this title already exists.' });
      return;
    }
    res.status(500).json({ message: 'Error updating project', error });
  }
};

/**
 * @desc    Delete a project card
 * @route   DELETE /api/project/:id
 */
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedProject = await ProjectM.findByIdAndDelete(id);

    if (!deletedProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

/**
 * @desc    Sync sequence positions after frontend grid movement
 * @route   PUT /api/project/reorder
 */
export const reorderProjects = async (req: Request, res: Response): Promise<void> => {
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

    await ProjectM.bulkWrite(bulkOperations);
    res.status(200).json({ message: 'Projects sequence alignment updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering projects records', error });
  }
};