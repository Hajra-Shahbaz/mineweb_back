import { type Request, type Response, type NextFunction } from 'express';
import TaskModel from '../model/listM.ts'

/**
 * @desc    Create a new task milestone entry node
 * @route   POST /api/tasks
 * @access  Public / Private (Depending on your auth setup)
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { subject, desc, deadline } = req.body;

    // Validate necessary explicit input bindings
    if (!subject || !deadline) {
      res.status(400).json({ success: false, message: 'Subject and deadline criteria are required fields.' });
      return;
    }

    // Build the dynamic textual local display timestamp on the server side
    const formattedCurrentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const newTask = await TaskModel.create({
      subject,
      desc,
      currentDate: formattedCurrentDate,
      deadline,
      isCompleted: false
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio milestone created successfully.',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch all task items from the collection
 * @route   GET /api/tasks
 * @access  Public
 */
export const getAllTasks = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sorted descending by system model creation timestamps
    const tasks = await TaskModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle completion state flags or modify text configurations
 * @route   PATCH /api/tasks/:id
 * @access  Public / Private
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedTask = await TaskModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // Return modified record layout context and enforce model validations
    );

    if (!updatedTask) {
      res.status(404).json({ success: false, message: 'Target task assignment node not located.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task structural configurations committed successfully.',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove task document permanently out of the database collection
 * @route   DELETE /api/tasks/:id
 * @access  Public / Private
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const targetedTask = await TaskModel.findByIdAndDelete(id);

    if (!targetedTask) {
      res.status(404).json({ success: false, message: 'Target task payload could not be located to drop.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task instance permanently purged from development loop.'
    });
  } catch (error) {
    next(error);
  }
};