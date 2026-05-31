import { Schema, model, Document } from 'mongoose';

export interface IServiceM extends Document {
  title: string;       // e.g., "Full-Stack Web Development"
  description: string; // Detail what you deliver (e.g., "Building clean, scalable web apps...")
  iconName?: string;   // Optional name of a Lucide/FontAwesome icon to use on the frontend
  imageUrl?: string;   // Optional asset/S3 link (User can skip it!)
}

const ServiceMSchema = new Schema<IServiceM>({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true // Prevents listing duplicate service titles
  },
  description: { 
    type: String, 
    required: true 
  },
  iconName: { 
    type: String, 
    trim: true,
    default: "" // Optional placeholder for frontend icon classes
  },
  imageUrl: { 
    type: String, 
    default: "" // Optional placeholder for S3 images or vector graphics
  }
}, { 
  timestamps: true 
});

export const ServiceM = model<IServiceM>('ServiceM', ServiceMSchema);