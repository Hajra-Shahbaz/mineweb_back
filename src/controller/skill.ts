import type { Request, Response } from 'express';
import { SkillModel } from '../model/skillM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

// --- CATEGORY FUNCTIONS ---

// --- CATEGORY: Add with optional images ---
export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    
    // Check if category already exists
    const existingCategory = await SkillModel.findOne({ category: category.trim() });
    if (existingCategory) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const lastItem = await SkillModel.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    // Upload images to S3 if they exist
    let image1Url = undefined;
    let image2Url = undefined;
    
    if (files?.['image1']?.[0]) {
      console.log('Uploading image1...');
      image1Url = await uploadFileToS3(files['image1'][0], 'categories');
      console.log('Image1 uploaded:', image1Url);
    }
    
    if (files?.['image2']?.[0]) {
      console.log('Uploading image2...');
      image2Url = await uploadFileToS3(files['image2'][0], 'categories');
      console.log('Image2 uploaded:', image2Url);
    }

    const newCategory = new SkillModel({
      category: category.trim(),
      image1: image1Url,
      image2: image2Url,
      order: nextOrderValue,
      skills: []
    });

    await newCategory.save();
    console.log('Category saved with images:', { image1: image1Url, image2: image2Url });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Error adding category', error: error instanceof Error ? error.message : error });
  }
};

// --- SKILL: Add only skill text/data ---
export const addSkillToCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { skill, order } = req.body;

    const category = await SkillModel.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const updatedCategory = await SkillModel.findByIdAndUpdate(
      categoryId,
      { 
        $push: { 
          skills: { 
            skill: skill.trim(), 
            order: order !== undefined ? order : (category.skills?.length || 0) 
          } 
        } 
      },
      { new: true }
    );
    res.status(201).json(updatedCategory);
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ message: 'Error adding skill', error: error instanceof Error ? error.message : error });
  }
};

export const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Find existing category
    const existingCategory = await SkillModel.findById(id);
    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Build update object
    const updateData: any = {};
    if (category) updateData.category = category.trim();

    // Upload new images if provided
    if (files?.['image1']?.[0]) {
      console.log('Uploading new image1...');
      updateData.image1 = await uploadFileToS3(files['image1'][0], 'categories');
      console.log('New image1 uploaded:', updateData.image1);
    }
    
    if (files?.['image2']?.[0]) {
      console.log('Uploading new image2...');
      updateData.image2 = await uploadFileToS3(files['image2'][0], 'categories');
      console.log('New image2 uploaded:', updateData.image2);
    }

    const updated = await SkillModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    console.log('Category updated with images:', { image1: updated?.image1, image2: updated?.image2 });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error instanceof Error ? error.message : error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await SkillModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.status(200).json({ message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error instanceof Error ? error.message : error });
  }
};

export const getAllData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await SkillModel.find().sort({ order: 1 });
    console.log(`Found ${data.length} categories`);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error: error instanceof Error ? error.message : error });
  }
};

export const reorderCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body;
    
    if (!Array.isArray(totalSequence)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    const bulkOps = totalSequence.map((item: any) => ({
      updateOne: { 
        filter: { _id: item.id }, 
        update: { $set: { order: item.order } } 
      }
    }));
    
    await SkillModel.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Categories reordered' });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ message: 'Error reordering', error: error instanceof Error ? error.message : error });
  }
};

// --- SKILL FUNCTIONS (Nested in Category) ---

export const editSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, skillId } = req.params;
    const { skill } = req.body;

    const updated = await SkillModel.findOneAndUpdate(
      { _id: categoryId, "skills._id": skillId },
      { $set: { "skills.$.skill": skill.trim() } },
      { new: true }
    );
    
    if (!updated) {
      res.status(404).json({ message: 'Category or skill not found' });
      return;
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error editing skill:', error);
    res.status(500).json({ message: 'Error editing skill', error: error instanceof Error ? error.message : error });
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
    
    if (!updated) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.status(200).json({ message: 'Skill deleted', category: updated });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Error deleting skill', error: error instanceof Error ? error.message : error });
  }
};

/**
 * @desc    Update the order of skills within a specific category
 * @route   PUT /api/skills/:categoryId/reorder-skills
 */
export const reorderSkillsInCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { newSkillsArray } = req.body;

    if (!Array.isArray(newSkillsArray)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

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
    console.error('Error reordering skills:', error);
    res.status(500).json({ message: 'Error reordering skills', error: error instanceof Error ? error.message : error });
  }
};