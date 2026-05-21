import { Schema, model, Document } from 'mongoose';

export interface ISkillM extends Document {
  name: string;
  category: string; // Changed from strict enum to a flexible string
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
  }
}, { 
  timestamps: true 
});

export const SkillM = model<ISkillM>('SkillM', SkillMSchema);