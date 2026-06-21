import type { Request, Response } from 'express';
import { SkillModel } from '../model/skillM.ts';
import { uploadFileToS3, deleteFileFromS3 } from '../utils/s3Service.ts';

// --- CATEGORY FUNCTIONS ---

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.body;
    
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
    const { category, deleteImage1, deleteImage2 } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    console.log('🔍 Edit Category Request:');
    console.log('  - ID:', id);
    console.log('  - Category:', category);
    console.log('  - deleteImage1:', deleteImage1, 'type:', typeof deleteImage1);
    console.log('  - deleteImage2:', deleteImage2, 'type:', typeof deleteImage2);
    console.log('  - Files:', files ? Object.keys(files) : 'none');

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
    
    if (category) updateData.category = category.trim();

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
    const category = await SkillModel.findById(req.params.id);
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

    await SkillModel.findByIdAndDelete(req.params.id);
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
    res.status(200).json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ message: 'Error reordering', error: error instanceof Error ? error.message : error });
  }
};

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