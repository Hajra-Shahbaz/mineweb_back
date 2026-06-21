import { Schema, model, Document } from 'mongoose';

// Interface for individual skill item
export interface ISkill {
  skill: string;
     // URL or file path for secondary/hover image
  order: number;      // Sequence for drag-and-drop within the category
}

// Interface for the Skill document
export interface ISkillCategory extends Document {
  category: string;
  skills: ISkill[];
   image1?: string;    // URL or file path for primary image
  image2?: string;
  order: number;      // Sequence for drag-and-drop of the whole category
}

// Schema for individual skill items (as a sub-document)
const SkillItemSchema = new Schema<ISkill>({
  skill: { 
    type: String, 
    required: true, 
    trim: true 
  },

  order: { 
    type: Number, 
    default: 0 
  }
}, { _id: false });

// Main Schema
const SkillCategorySchema = new Schema<ISkillCategory>({
  category: { 
    type: String, 
    required: true, 
    trim: true 
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
    default: 0 
  }
}, { 
  timestamps: true 
});

export const SkillModel = model<ISkillCategory>('Skill', SkillCategorySchema);