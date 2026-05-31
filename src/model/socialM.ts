import { Schema, model, Document } from 'mongoose';

export interface ISocialM extends Document {
  platform: string;    // e.g., "LinkedIn", "GitHub"
  url: string;         // e.g., "https://linkedin.com/in/username"
  iconName?: string;   // Optional Lucide/FontAwesome icon identifier string for the frontend
}

const SocialMSchema = new Schema<ISocialM>({
  platform: { 
    type: String, 
    required: true, 
    unique: true, // Prevents linking the same platform twice
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
    default: "" // Optional placeholder for matching design icons on the frontend
  }
}, { 
  timestamps: true 
});

export const SocialM = model<ISocialM>('SocialM', SocialMSchema);