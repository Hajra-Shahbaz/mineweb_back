import { Schema, model, Document, Types } from 'mongoose';

// --- Category Model ---
export interface ICategory extends Document {
  name: string;
  image1?: string;
  image2?: string;
  order: number;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  image1: String,
  image2: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const CategoryM = model<ICategory>('CategoryM', CategorySchema);

// --- Skill Model ---
export interface ISkillM extends Document {
  name: string;
  categories: Types.ObjectId[]; // Allows one skill to be in multiple categories
  order: number;
}

const SkillMSchema = new Schema<ISkillM>({
  name: { type: String, required: true, unique: true, trim: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'CategoryM' }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const SkillM = model<ISkillM>('SkillM', SkillMSchema);