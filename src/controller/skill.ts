import type { Request, Response } from 'express';
import { SkillModel } from '../model/skillM.ts';
import { uploadFileToS3, deleteFileFromS3 } from '../utils/s3Service.ts';

// --- CATEGORY FUNCTIONS ---

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    
    if (!category || !category.trim()) {
      res.status(400).json({ message: 'Category name is required' });
      return;
    }

    const existingCategory = await SkillModel.findOne({ category: category.trim() });
    if (existingCategory) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }

    const lastItem = await SkillModel.findOne().sort({ order: -1 });
    const nextOrderValue = lastItem ? lastItem.order + 1 : 0;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
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

export const addSkillToCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { skill, order, isAchieved, percentage } = req.body;

    // Validate ObjectId without importing mongoose
    if (!categoryId || categoryId.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    const category = await SkillModel.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    if (!skill || !skill.trim()) {
      res.status(400).json({ message: 'Skill name is required' });
      return;
    }

    // Check if skill already exists in category
    const skillExists = category.skills.some(
      (s) => s.skill.toLowerCase() === skill.trim().toLowerCase()
    );
    
    if (skillExists) {
      res.status(400).json({ message: 'Skill already exists in this category' });
      return;
    }

    const skillOrder = order !== undefined ? order : (category.skills?.length || 0);
    
    const updatedCategory = await SkillModel.findByIdAndUpdate(
      categoryId,
      { 
        $push: { 
          skills: { 
            skill: skill.trim(), 
            order: skillOrder,
            isAchieved: isAchieved || false,
            percentage: percentage || 0
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
    const { category, deleteImage1, deleteImage2 } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    console.log('🔍 Edit Category Request:');
    console.log('  - ID:', id);
    console.log('  - Category:', category);
    console.log('  - deleteImage1:', deleteImage1, 'type:', typeof deleteImage1);
    console.log('  - deleteImage2:', deleteImage2, 'type:', typeof deleteImage2);
    console.log('  - Files:', files ? Object.keys(files) : 'none');

    // Validate ObjectId without importing mongoose
    if (!id || id.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    // Find existing category
    const existingCategory = await SkillModel.findById(id);
    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    console.log('📦 Existing Category:', {
      id: existingCategory._id,
      category: existingCategory.category,
      image1: existingCategory.image1,
      image2: existingCategory.image2
    });

    // Build update object
    const updateData: any = {};
    const unsetData: any = {};
    
    if (category && category.trim()) {
      // Check if new category name conflicts with existing
      const categoryExists = await SkillModel.findOne({ 
        category: category.trim(), 
        _id: { $ne: id } 
      });
      
      if (categoryExists) {
        res.status(400).json({ message: 'Category name already exists' });
        return;
      }
      
      updateData.category = category.trim();
    }

    // Handle Image 1 - Check for both string 'true' and boolean true
    const shouldDeleteImage1 = deleteImage1 === 'true' || deleteImage1 === true;
    console.log('🗑️ Should delete image1?', shouldDeleteImage1);

    if (shouldDeleteImage1) {
      // Delete existing image from S3 if it exists
      if (existingCategory.image1) {
        try {
          await deleteFileFromS3(existingCategory.image1);
          console.log('✅ Deleted image1 from S3:', existingCategory.image1);
        } catch (error) {
          console.error('❌ Error deleting image1 from S3:', error);
        }
      }
      unsetData.image1 = "";
      console.log('📝 Will unset image1 field');
    } else if (files?.['image1']?.[0]) {
      // Upload new image if provided
      console.log('📤 Uploading new image1...');
      // Delete old image if exists
      if (existingCategory.image1) {
        try {
          await deleteFileFromS3(existingCategory.image1);
          console.log('✅ Deleted old image1 from S3:', existingCategory.image1);
        } catch (error) {
          console.error('❌ Error deleting old image1 from S3:', error);
        }
      }
      updateData.image1 = await uploadFileToS3(files['image1'][0], 'categories');
      console.log('✅ New image1 uploaded:', updateData.image1);
    }

    // Handle Image 2 - Check for both string 'true' and boolean true
    const shouldDeleteImage2 = deleteImage2 === 'true' || deleteImage2 === true;
    console.log('🗑️ Should delete image2?', shouldDeleteImage2);

    if (shouldDeleteImage2) {
      // Delete existing image from S3 if it exists
      if (existingCategory.image2) {
        try {
          await deleteFileFromS3(existingCategory.image2);
          console.log('✅ Deleted image2 from S3:', existingCategory.image2);
        } catch (error) {
          console.error('❌ Error deleting image2 from S3:', error);
        }
      }
      unsetData.image2 = "";
      console.log('📝 Will unset image2 field');
    } else if (files?.['image2']?.[0]) {
      // Upload new image if provided
      console.log('📤 Uploading new image2...');
      // Delete old image if exists
      if (existingCategory.image2) {
        try {
          await deleteFileFromS3(existingCategory.image2);
          console.log('✅ Deleted old image2 from S3:', existingCategory.image2);
        } catch (error) {
          console.error('❌ Error deleting old image2 from S3:', error);
        }
      }
      updateData.image2 = await uploadFileToS3(files['image2'][0], 'categories');
      console.log('✅ New image2 uploaded:', updateData.image2);
    }

    // Build the update query
    const updateQuery: any = {};
    if (Object.keys(updateData).length > 0) {
      updateQuery.$set = updateData;
    }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    console.log('📝 Final update query:', JSON.stringify(updateQuery, null, 2));

    if (Object.keys(updateQuery).length === 0) {
      // No changes, return existing category
      console.log('ℹ️ No changes to apply');
      res.status(200).json(existingCategory);
      return;
    }

    const updated = await SkillModel.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true }
    );
    
    console.log('✅ Category updated successfully:', {
      id: updated?._id,
      category: updated?.category,
      image1: updated?.image1,
      image2: updated?.image2
    });
    
    res.status(200).json(updated);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({ message: 'Error updating category', error: error instanceof Error ? error.message : error });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId without importing mongoose
    if (!id || id.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    const category = await SkillModel.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Delete images from S3 if they exist
    if (category.image1) {
      try {
        await deleteFileFromS3(category.image1);
        console.log('Deleted image1 from S3:', category.image1);
      } catch (error) {
        console.error('Error deleting image1 from S3:', error);
      }
    }
    if (category.image2) {
      try {
        await deleteFileFromS3(category.image2);
        console.log('Deleted image2 from S3:', category.image2);
      } catch (error) {
        console.error('Error deleting image2 from S3:', error);
      }
    }

    await SkillModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Category removed successfully' });
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

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId without importing mongoose
    if (!id || id.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    const category = await SkillModel.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category', error: error instanceof Error ? error.message : error });
  }
};

export const reorderCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { totalSequence } = req.body;
    
    if (!Array.isArray(totalSequence)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    if (totalSequence.length === 0) {
      res.status(400).json({ message: 'Sequence array cannot be empty' });
      return;
    }

    // Validate all items have id and order
    for (const item of totalSequence) {
      if (!item.id || item.order === undefined) {
        res.status(400).json({ message: 'Each item must have id and order' });
        return;
      }
      // Validate ObjectId without importing mongoose
      if (!item.id || item.id.length !== 24) {
        res.status(400).json({ message: `Invalid ID format: ${item.id}` });
        return;
      }
    }

    const bulkOps = totalSequence.map((item: any) => ({
      updateOne: { 
        filter: { _id: item.id }, 
        update: { $set: { order: item.order } } 
      }
    }));
    
    const result = await SkillModel.bulkWrite(bulkOps);
    console.log(`Reordered ${result.modifiedCount} categories`);
    res.status(200).json({ message: 'Categories reordered successfully', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ message: 'Error reordering', error: error instanceof Error ? error.message : error });
  }
};

// --- SKILL FUNCTIONS ---

export const editSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, skillId } = req.params;
    const { skill, isAchieved, percentage, order } = req.body;

    // Validate ObjectId without importing mongoose
    if (!categoryId || categoryId.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    if (!skillId || skillId.length !== 24) {
      res.status(400).json({ message: 'Invalid skill ID format' });
      return;
    }

    if (!skill || !skill.trim()) {
      res.status(400).json({ message: 'Skill name is required' });
      return;
    }

    // Build update object for skill
    const updateObj: any = {
      "skills.$.skill": skill.trim()
    };

    if (isAchieved !== undefined) {
      updateObj["skills.$.isAchieved"] = isAchieved;
    }

    if (percentage !== undefined) {
      if (percentage < 0 || percentage > 100) {
        res.status(400).json({ message: 'Percentage must be between 0 and 100' });
        return;
      }
      updateObj["skills.$.percentage"] = percentage;
    }

    if (order !== undefined) {
      updateObj["skills.$.order"] = order;
    }

    const updated = await SkillModel.findOneAndUpdate(
      { _id: categoryId, "skills._id": skillId },
      { $set: updateObj },
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

    // Validate ObjectId without importing mongoose
    if (!categoryId || categoryId.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    if (!skillId || skillId.length !== 24) {
      res.status(400).json({ message: 'Invalid skill ID format' });
      return;
    }
    
    const updated = await SkillModel.findByIdAndUpdate(
      categoryId,
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    );
    
    if (!updated) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.status(200).json({ message: 'Skill deleted successfully', category: updated });
  } catch (error) {
    console.error('Error deleting skill:', error);
    res.status(500).json({ message: 'Error deleting skill', error: error instanceof Error ? error.message : error });
  }
};

export const reorderSkillsInCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const { newSkillsArray } = req.body;

    // Validate ObjectId without importing mongoose
    if (!categoryId || categoryId.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    if (!Array.isArray(newSkillsArray)) {
      res.status(400).json({ message: 'Invalid payload structure. Array required.' });
      return;
    }

    if (newSkillsArray.length === 0) {
      res.status(400).json({ message: 'Skills array cannot be empty' });
      return;
    }

    // Validate each skill in the array
    for (const skill of newSkillsArray) {
      if (!skill._id) {
        res.status(400).json({ message: 'Each skill must have an _id' });
        return;
      }
      if (skill.order === undefined) {
        res.status(400).json({ message: 'Each skill must have an order' });
        return;
      }
      if (!skill.skill || !skill.skill.trim()) {
        res.status(400).json({ message: 'Each skill must have a name' });
        return;
      }
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

export const updateSkillAchievement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, skillId } = req.params;
    const { isAchieved, percentage } = req.body;

    // Validate ObjectId without importing mongoose
    if (!categoryId || categoryId.length !== 24) {
      res.status(400).json({ message: 'Invalid category ID format' });
      return;
    }

    if (!skillId || skillId.length !== 24) {
      res.status(400).json({ message: 'Invalid skill ID format' });
      return;
    }

    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      res.status(400).json({ message: 'Percentage must be between 0 and 100' });
      return;
    }

    const updateObj: any = {};
    if (isAchieved !== undefined) {
      updateObj["skills.$.isAchieved"] = isAchieved;
    }
    if (percentage !== undefined) {
      updateObj["skills.$.percentage"] = percentage;
    }

    if (Object.keys(updateObj).length === 0) {
      res.status(400).json({ message: 'No update fields provided' });
      return;
    }

    const updated = await SkillModel.findOneAndUpdate(
      { _id: categoryId, "skills._id": skillId },
      { $set: updateObj },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Category or skill not found' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating skill achievement:', error);
    res.status(500).json({ message: 'Error updating skill achievement', error: error instanceof Error ? error.message : error });
  }
};