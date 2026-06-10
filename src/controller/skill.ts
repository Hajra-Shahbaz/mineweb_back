import type { Request, Response } from 'express';
import { SkillM } from '../model/skillM.ts';

/**
 * @desc    Add a new skill with a completely custom or traditional category
 * @route   POST /api/skill
 */
export const addSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      res.status(400).json({ message: 'Both skill name and category are required.' });
      return;
    }

    const existingSkill = await SkillM.findOne({ name: name.trim() });
    if (existingSkill) {
      res.status(400).json({ message: 'This skill is already added!' });
      return;
    }

    // 🌟 Calculate the next sequential layout position index
    const lastItem = await SkillM.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    // Creating the skill works smoothly with any custom category string the user inputs
    const newSkill = new SkillM({ 
      name, 
      category, 
      order: nextOrderValue 
    });
    
    const savedSkill = await newSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error });
  }
};

/**
 * @desc    Get all skills (Sorted by custom order sequence index)
 * @route   GET /api/skill
 */
export const getAllSkills = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 🌟 Returns data sorted exactly how you dragged it in your layout control suite
    const skills = await SkillM.find().sort({ order: 1 });
    res.status(200).json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error });
  }
};

/**
 * @desc    Update an item's fields or change it to an entirely new category
 * @route   PUT /api/skill/:id
 */
export const editSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const updatedSkill = await SkillM.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSkill) {
      res.status(404).json({ message: 'Skill not found with that ID' });
      return;
    }

    res.status(200).json(updatedSkill);
  } catch (error) {
    res.status(500).json({ message: 'Error updating skill', error });
  }
};

/**
 * @desc    Delete a specific skill from your stack
 * @route   DELETE /api/skill/:id
 */
export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedSkill = await SkillM.findByIdAndDelete(id);

    if (!deletedSkill) {
      res.status(404).json({ message: 'Skill not found with that ID' });
      return;
    }

    res.status(200).json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error });
  }
};

/**
 * @desc    Sync order sequence layout after a frontend drag-and-drop movement
 * @route   PUT /api/skill/reorder
 */
export const reorderSkills = async (req: Request, res: Response): Promise<void> => {
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

    await SkillM.bulkWrite(bulkOperations);
    res.status(200).json({ message: 'Skill sequence alignment updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering skill records', error });
  }
};