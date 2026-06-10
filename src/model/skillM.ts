import { Schema, model, Document } from 'mongoose';

export interface ISkillM extends Document {
  name: string;
  category: string;
  order: number; // 🌟 Added custom layout index sequencing sequence property
}

const SkillMSchema = new Schema<ISkillM>({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true // Automatically normalizes custom categories (e.g. "Web3" -> "web3")
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, { 
  timestamps: true 
});

export const SkillM = model<ISkillM>('SkillM', SkillMSchema);