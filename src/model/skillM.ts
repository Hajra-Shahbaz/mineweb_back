import { Schema, model, Document } from 'mongoose';

// Interface for individual skill item
export interface ISkill {
  skill: string;
  order: number;
  isAchieved?: boolean;
  percentage?: number;
  _id?: any;
}

// Interface for the Skill document
export interface ISkillCategory extends Document {
  category: string;
  skills: ISkill[];
  image1?: string;
  image2?: string;
  order: number;
}

// Schema for individual skill items (sub-document)
const SkillItemSchema = new Schema<ISkill>({
  skill: { 
    type: String, 
    required: true, 
    trim: true 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isAchieved: {
    type: Boolean,
    default: false
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

// Main Schema
const SkillCategorySchema = new Schema<ISkillCategory>({
  category: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true // Automatically creates a unique index on category
  },
  image1: { 
    type: String, 
    trim: true 
  },
  image2: { 
    type: String, 
    trim: true 
  },
  skills: [SkillItemSchema],
  order: { 
    type: Number, 
    default: 0,
    index: true // Defines the index here to avoid separate duplicate calls
  }
}, { 
  timestamps: true 
});

export const SkillModel = model<ISkillCategory>('Skill', SkillCategorySchema);