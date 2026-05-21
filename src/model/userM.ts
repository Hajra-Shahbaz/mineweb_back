import { Schema, model, Document } from 'mongoose';

// 1. TypeScript Interface definition
export interface IUserM extends Document {
  name: string;
  title: string;       // e.g., "Full-Stack Web Developer"
  aboutText: string;   // Your main dynamic bio description
  subText?: string;    // An extra small tagline or introductory text
  avatarUrl?: string;  // Will store the S3 bucket object URL for your profile pic
  resumeUrl?: string;  // Will store the S3 bucket object URL for your CV PDF
}

// 2. Mongoose Schema matching the interface
const UserMSchema = new Schema<IUserM>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  aboutText: { 
    type: String, 
    required: true 
  },
  subText: { 
    type: String, 
    trim: true 
  },
  avatarUrl: { 
    type: String       // String to hold the uploaded AWS S3 URL
  },
  resumeUrl: { 
    type: String       // String to hold the uploaded AWS S3 URL
  }
}, { 
  timestamps: true    // Tracks when you last modified your hero/about section
});

// 3. Export the model matching your specific file name
export const UserM = model<IUserM>('UserM', UserMSchema);