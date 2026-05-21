import { Schema, model, Document } from 'mongoose';

export interface IProjectM extends Document {
  title: string;
  description: string;
  techStack: string[];     // Array of strings (e.g., ["React", "Node.js"])
  liveUrl?: string;        // Optional live deployment link
  githubUrl?: string;      // Optional source code link
  imageUrl?: string;       // Optional S3 image link (User can skip it!)
}

const ProjectMSchema = new Schema<IProjectM>({
  title: { 
    type: String, 
    required: true, 
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
    default: "" // No required rule here; falls back to an empty string if skipped
  }
}, { 
  timestamps: true 
});

export const ProjectM = model<IProjectM>('ProjectM', ProjectMSchema);