import { Schema, model, Document } from 'mongoose';

export interface ISocialM extends Document {
  platform: string;    // e.g., "LinkedIn", "GitHub"
  url: string;         // e.g., "https://linkedin.com/in/username"
  iconName?: string;   // Optional Lucide icon string
  order: number;       // 🌟 Track custom drag-and-drop order indices
}

const SocialMSchema = new Schema<ISocialM>({
  platform: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  url: { 
    type: String, 
    required: true, 
    trim: true 
  },
  iconName: { 
    type: String, 
    trim: true,
    default: "" 
  },
  order: {
    type: Number,
    required: true,
    default: 0 // 🌟 Defaults to 0, though we will compute it incrementally during creation
  }
}, { 
  timestamps: true 
});

export const SocialM = model<ISocialM>('SocialM', SocialMSchema);