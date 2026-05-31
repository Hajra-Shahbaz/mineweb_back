import { Schema, model, Document } from 'mongoose';

export interface IEducationM extends Document {
  institute: string;     // e.g., "BISE Lahore" or University name
  degree: string;        // e.g., "Intermediate in Computer Science", "Bachelor's"
  duration: string;      // e.g., "2024 - 2026"
  description?: string;  // Optional text about key subjects or achievements
  order: number;         // Tracks custom drag-and-drop placement sequence
}

const EducationMSchema = new Schema<IEducationM>({
  institute: { 
    type: String, 
    required: true, 
    trim: true 
  },
  degree: { 
    type: String, 
    required: true, 
    trim: true 
  },
  duration: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  order: { 
    type: Number, 
    default: 0 // Default index position when a new block is added
  }
}, { 
  timestamps: true 
});

export const EducationM = model<IEducationM>('EducationM', EducationMSchema);