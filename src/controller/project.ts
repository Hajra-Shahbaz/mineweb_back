import type { Request, Response } from 'express';
import { ProjectM } from '../model/projectM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

/**
 * @desc    Add a new project + auto-calculate order sequence
 * @route   POST /api/project
 */
export const addProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for duplicate title
    if (req.body.title) {
      const existingProject = await ProjectM.findOne({ 
        title: { $regex: new RegExp(`^${req.body.title.trim()}$`, 'i') } 
      });
      if (existingProject) {
        res.status(400).json({ 
          success: false,
          message: 'A project with this title already exists.' 
        });
        return;
      }
    }

    // Dynamic sequencing
    const lastItem = await ProjectM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    let projectData: any = { 
      ...req.body,
      order: nextOrderValue 
    };

    // Handle techStack if it comes as string
    if (typeof projectData.techStack === 'string') {
      try {
        projectData.techStack = JSON.parse(projectData.techStack);
      } catch {
        projectData.techStack = projectData.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Ensure techStack is an array
    if (!Array.isArray(projectData.techStack)) {
      projectData.techStack = [];
    }

    // Convert string booleans to actual booleans
    if (projectData.isHidden !== undefined) {
      projectData.isHidden = projectData.isHidden === 'true' || projectData.isHidden === true;
    }
    if (projectData.isWorking !== undefined) {
      projectData.isWorking = projectData.isWorking === 'true' || projectData.isWorking === true;
    }

    // Upload image if file is provided
    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'projects');
      projectData.imageUrl = uploadedUrl;
    }

    const newProject = new ProjectM(projectData);
    const savedProject = await newProject.save();
    
    res.status(201).json({
      success: true,
      data: savedProject,
      message: 'Project created successfully'
    });

  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false,
        message: 'Duplicate error: A project with this title already exists.' 
      });
      return;
    }
    console.error('Error adding project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all projects (Sorted by drag-and-drop layout order)
 * @route   GET /api/project
 */
export const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await ProjectM.find()
      .sort({ order: 1 })
      .lean();
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching projects', 
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/project/:id
 */
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await ProjectM.findById(id).lean();
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Edit a specific project dynamically
 * @route   PUT /api/project/:id
 */
export const editProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let updateFields: any = { ...req.body };

    // Check for duplicate title (excluding current project)
    if (updateFields.title) {
      const duplicateCheck = await ProjectM.findOne({ 
        title: { $regex: new RegExp(`^${updateFields.title.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (duplicateCheck) {
        res.status(400).json({
          success: false,
          message: 'Another project already uses this title.'
        });
        return;
      }
    }

    // Handle techStack if it comes as string
    if (typeof updateFields.techStack === 'string') {
      try {
        updateFields.techStack = JSON.parse(updateFields.techStack);
      } catch {
        updateFields.techStack = updateFields.techStack.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Ensure techStack is an array
    if (updateFields.techStack !== undefined && !Array.isArray(updateFields.techStack)) {
      updateFields.techStack = [];
    }

    // Convert string booleans to actual booleans
    if (updateFields.isHidden !== undefined) {
      updateFields.isHidden = updateFields.isHidden === 'true' || updateFields.isHidden === true;
    }
    if (updateFields.isWorking !== undefined) {
      updateFields.isWorking = updateFields.isWorking === 'true' || updateFields.isWorking === true;
    }

    // Upload new image if file is provided
    if (req.file) {
      const uploadedUrl = await uploadFileToS3(req.file, 'projects');
      updateFields.imageUrl = uploadedUrl;
    }

    // Remove fields that shouldn't be updated directly
    delete updateFields._id;
    delete updateFields.__v;
    delete updateFields.createdAt;
    delete updateFields.updatedAt;

    const updatedProject = await ProjectM.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Duplicate error: A project with this title already exists.'
      });
      return;
    }
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    // Reorder remaining projects to fill the gap
    await ProjectM.updateMany(
      { order: { $gt: deletedProject.order } },
      { $inc: { order: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: deletedProject
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Sync sequence positions after frontend grid movement
 * @route   PUT /api/project/reorder
 */
export const reorderProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body;

    if (!Array.isArray(totalSequence) || totalSequence.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid payload structure. Array required.'
      });
      return;
    }

    const isValid = totalSequence.every(
      (item: any) => item.id && typeof item.order === 'number'
    );

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: 'Each item must have id and order fields'
      });
      return;
    }

    const bulkOperations = totalSequence.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    const result = await ProjectM.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: 'Projects reordered successfully',
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error reordering projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering projects',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Toggle project visibility (hide/show)
 * @route   PATCH /api/project/:id/toggle-visibility
 */
export const toggleProjectVisibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await ProjectM.findById(id);
    
    if (!project) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    const updatedProject = await ProjectM.findByIdAndUpdate(
      id,
      { $set: { isHidden: !project.isHidden } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProject,
      message: `Project ${updatedProject?.isHidden ? 'hidden' : 'shown'} successfully`
    });
  } catch (error) {
    console.error('Error toggling project visibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling project visibility',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Get only visible projects (for frontend display)
 * @route   GET /api/project/visible
 */
export const getVisibleProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await ProjectM.find({ isHidden: false }).sort({ order: 1 }).lean();
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching visible projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visible projects',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * @desc    Bulk delete projects
 * @route   DELETE /api/project/bulk
 */
export const bulkDeleteProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Array of project IDs is required'
      });
      return;
    }

    const result = await ProjectM.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} project(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error bulk deleting projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting projects',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};