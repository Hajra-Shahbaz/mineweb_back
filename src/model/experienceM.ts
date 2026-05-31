import { Schema, model, Document } from 'mongoose';

export interface IExperienceM extends Document {
  company: string;
  role: string;
  location?: string;
  startDate: string;       // e.g., "Jan 2025" or "2025-01"
  endDate?: string;        // Optional if it's your current job
  currentJob: boolean;    // True if you are still working here
  description: string;    // Bullet points or paragraph about what you built
  companyLogoUrl?: string; // 🌟 Stores exactly one S3 bucket URL for the company logo
  order: number;          // 🌟 Tracks custom drag-and-drop placement sequence
}

const ExperienceMSchema = new Schema<IExperienceM>({
  company: { 
    type: String, 
    required: true, 
    trim: true 
  },
  role: { 
    type: String, 
    required: true, 
    trim: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  startDate: { 
    type: String, 
    required: true 
  },
  endDate: { 
    type: String,
    // Validates that an end date is provided if it's not your current job
    required: function(this: any) { return !this.currentJob; }
  },
  currentJob: { 
    type: Boolean, 
    default: false 
  },
  description: { 
    type: String, 
    required: true 
  },
  companyLogoUrl: {
    type: String,
    default: "" // Single image string field
  },
  order: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

export const ExperienceM = model<IExperienceM>('ExperienceM', ExperienceMSchema);