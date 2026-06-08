import { Schema, model, Document } from 'mongoose';

export interface IProjectM extends Document {
  title: string;
  description: string;
  techStack: string[];     
  liveUrl?: string;        
  githubUrl?: string;      
  imageUrl?: string;       
  order: number; // <-- Added for Drag-and-Drop sequencing
}

const ProjectMSchema = new Schema<IProjectM>({
  title: {  
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  techStack: { 
    type: [String], 
    required: true 
  },
  liveUrl: { 
    type: String, 
    trim: true 
  },
  githubUrl: { 
    type: String, 
    trim: true 
  },
  imageUrl: { 
    type: String, 
    default: "" 
  },
  order: { 
    type: Number, 
    required: true,
    default: 0 // Will auto-increment on creation
  }
}, { 
  timestamps: true 
});

export const ProjectM = model<IProjectM>('ProjectM', ProjectMSchema);