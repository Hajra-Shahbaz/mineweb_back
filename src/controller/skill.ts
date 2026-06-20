import { type Request, type Response } from 'express';
import { CategoryM, SkillM } from '../model/skillM.ts';
import { uploadFileToS3 } from '../utils/s3Service.ts';

// --- Category Functions ---
export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let categoryData = { ...req.body };

    const image1 = files?.image1?.[0];
    const image2 = files?.image2?.[0];

    if (image1) categoryData.image1 = await uploadFileToS3(image1, 'categories');
    if (image2) categoryData.image2 = await uploadFileToS3(image2, 'categories');

    const lastItem = await CategoryM.findOne().sort({ order: -1 });
    categoryData.order = lastItem ? lastItem.order + 1 : 0;

    const newCategory = new CategoryM(categoryData);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) { res.status(500).json({ message: 'Error adding category', error }); }
};

export const editCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    let updateFields = { ...req.body };

    const image1 = files?.image1?.[0];
    const image2 = files?.image2?.[0];

    // Use 'as Express.Multer.File' to explicitly tell TypeScript the type
    if (image1) updateFields.image1 = await uploadFileToS3(image1 as Express.Multer.File, 'categories');
    if (image2) updateFields.image2 = await uploadFileToS3(image2 as Express.Multer.File, 'categories');

    const updated = await CategoryM.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: 'Error updating category', error }); }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    await CategoryM.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) { res.status(500).json({ message: 'Error deleting', error }); }
};

// --- Skill Functions ---
export const addSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categories } = req.body;
    const lastItem = await SkillM.findOne().sort({ order: -1 });
    const newSkill = new SkillM({ name, categories, order: lastItem ? lastItem.order + 1 : 0 });
    await newSkill.save();
    res.status(201).json(newSkill);
  } catch (error) { res.status(500).json({ message: 'Error adding skill', error }); }
};

export const getAllSkills = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skills = await SkillM.find().sort({ order: 1 }).populate('categories');
    res.status(200).json(skills);
  } catch (error) { res.status(500).json({ message: 'Error fetching', error }); }
};

export const editSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await SkillM.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.status(200).json(updated);
  } catch (error) { res.status(500).json({ message: 'Error updating', error }); }
};

export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    await SkillM.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Skill deleted' });
  } catch (error) { res.status(500).json({ message: 'Error deleting', error }); }
};

// --- Reorder Helpers ---
const reorderItems = async (req: Request, res: Response, model: any): Promise<void> => {
  try {
    const { totalSequence } = req.body;
    const bulkOps = totalSequence.map((item: { id: string; order: number }) => ({
      updateOne: { filter: { _id: item.id }, update: { $set: { order: item.order } } }
    }));
    await model.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Sequence updated' });
  } catch (error) { res.status(500).json({ message: 'Error reordering', error }); }
};

export const reorderCategory = (req: Request, res: Response) => reorderItems(req, res, CategoryM);
export const reorderSkills = (req: Request, res: Response) => reorderItems(req, res, SkillM);