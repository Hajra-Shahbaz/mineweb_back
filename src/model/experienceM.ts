import { Schema, model, Document } from 'mongoose';

export interface IExperienceM extends Document {
  company: string;
  role: string;
  location?: string;
  startDate: string;       // e.g., "Jan 2025"
  endDate?: string;        // Optional if it's your current job
  currentJob: boolean;    // True if you are still working here
  description: string;    // Bullet points or paragraph about what you built
  companyLogoUrl?: string; 
  order: number;          
}

const ExperienceMSchema = new Schema<IExperienceM>({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String, required: true },
  currentJob: { type: Boolean, default: false },
  endDate: { 
    type: String,
    // Robust validation check for both .save() and .findByIdAndUpdate() operations
    required: function(this: any) {
      // 1. If it's a direct findByIdAndUpdate operation check:
      if (this.getUpdate && typeof this.getUpdate === 'function') {
        const update = this.getUpdate();
        const isCurrent = update.$set?.currentJob ?? update.currentJob;
        if (isCurrent === true || isCurrent === 'true') return false;
        return true;
      }
      // 2. Default document .save() context validation mapping check:
      return !this.currentJob; 
    }
  },
  description: { type: String, required: true },
  companyLogoUrl: { type: String, default: "" },
  order: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

export const ExperienceM = model<IExperienceM>('ExperienceM', ExperienceMSchema);