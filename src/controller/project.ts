import type { Request, Response } from 'express';
import { ProjectM } from '../model/projectM.ts';

/**
 * @desc    Add a new project
 * @route   POST /api/project
 */
export const addProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProject = new ProjectM(req.body);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error adding project', error });
  }
};

/**
 * @desc    Get all projects
 * @route   GET /api/project
 */
export const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await ProjectM.find().sort({ createdAt: -1 });
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

    const updatedProject = await ProjectM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.status(200).json(updatedProject);
  } catch (error) {
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