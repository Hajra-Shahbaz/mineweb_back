import type { Request, Response } from 'express';
import { SkillModel } from '../model/skillM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

// --- CATEGORY FUNCTIONS ---

// --- CATEGORY: Add with optional images ---
export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    const lastItem = await SkillModel.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let image1 = files?.['image1']?.[0] ? await uploadFileToS3(files['image1'][0], 'categories') : undefined;
    let image2 = files?.['image2']?.[0] ? await uploadFileToS3(files['image2'][0], 'categories') : undefined;

    const newCategory = new SkillModel({
      category,
      image1,
      image2,
      order: nextOrderValue
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error adding category', error });
  }
};

// --- SKILL: Add only skill text/data ---
export const addSkillToCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { skill, order } = req.body;

    const updatedCategory = await SkillModel.findByIdAndUpdate(
      categoryId,
      { $push: { skills: { skill, order: order || 0 } } }, // No images here anymore
      { new: true }
    );
    res.status(201).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error adding skill', error });
  }
};
export const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await SkillModel.findByIdAndUpdate(
      req.params.id,
      { $set: { category: req.body.category } },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await SkillModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};

export const getAllData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SkillModel.find().sort({ order: 1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

export const reorderCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body; // Array of { id, order }
    const bulkOps = totalSequence.map((item: any) => ({
      updateOne: { filter: { _id: item.id }, update: { $set: { order: item.order } } }
    }));
    await SkillModel.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering', error });
  }
};

// --- SKILL FUNCTIONS (Nested in Category) ---



export const editSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, skillId } = req.params;
    // Note: Using positional operator to update specific nested element
    const updated = await SkillModel.findOneAndUpdate(
      { _id: categoryId, "skills._id": skillId },
      { $set: { "skills.$.skill": req.body.skill } },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error editing skill', error });
  }
};

export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, skillId } = req.params;
    const updated = await SkillModel.findByIdAndUpdate(
      categoryId,
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error });
  }
};

/**
 * @desc    Update the order of skills within a specific category
 * @route   PUT /api/skills/:categoryId/reorder-skills
 */
export const reorderSkillsInCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    // Expected payload: { "newSkillsArray": [{ _id: "...", skill: "...", order: 0 }, ...] }
    const { newSkillsArray } = req.body;

    if (!Array.isArray(newSkillsArray)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    // We overwrite the entire skills array for this category with the sorted version
    const updatedCategory = await SkillModel.findByIdAndUpdate(
      categoryId,
      { $set: { skills: newSkillsArray } },
      { new: true }
    );

    if (!updatedCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json({ 
      message: 'Skill sequence updated within category', 
      skills: updatedCategory.skills 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reordering skills', error });
  }
};