import { Schema, model, Document } from 'mongoose';

// 1. Define the internal structure of a profile picture object
interface IProfilePicture {
  url: string;
  isActive: boolean;
}

// 2. TypeScript Interface definition matching all data fields
export interface IUserM extends Document {
  name: string;
  email: string;          // 🌟 Added email
  phoneNumber?: string;   // 🌟 Added optional phone number
  title: string;          // e.g., "Full-Stack Web Developer"
  aboutText: string;      // Your main dynamic bio description
  subText?: string;       // An extra small tagline or introductory text
  profilePictures: IProfilePicture[]; 
  resumeUrl?: string;     // Will store the S3 bucket object URL for your CV PDF
}

// 3. Mongoose Schema matching the interface definitions precisely
const UserMSchema = new Schema<IUserM>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: {                // 🌟 Added email with validation
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phoneNumber: {          // 🌟 Added phoneNumber
    type: String, 
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
  profilePictures: [
    {
      url: { type: String, required: true },
      isActive: { type: Boolean, default: false }
    }
  ],
  resumeUrl: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true // Tracks when you last modified your hero/about section
});

// 4. Export the model matching your specific file name
export const UserM = model<IUserM>('UserM', UserMSchema);