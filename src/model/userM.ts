import { Schema, model, Document } from 'mongoose';

// 1. Define the internal structure of a profile picture object
interface IProfilePicture {
  url: string;
  isActive: boolean;
}

// 2. Updated TypeScript Interface
export interface IUserM extends Document {
  name: string;
  email: string;
  phoneNumber?: string;
  title: string;
  aboutText: string;
  subText?: string;
  profilePictures: IProfilePicture[];
  resumeUrl?: string;
  address?: string;     // 🌟 Added address
  mainColor?: string;   // 🌟 Added mainColor
}

// 3. Updated Mongoose Schema
const UserMSchema = new Schema<IUserM>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phoneNumber: { 
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
  },
  address: {            // 🌟 Added to Schema
    type: String, 
    trim: true 
  },
  mainColor: {          // 🌟 Added to Schema
    type: String, 
    trim: true,
    default: "#000000" // Optional: default color
  }
}, { 
  timestamps: true 
});

// 4. Export the model
export const UserM = model<IUserM>('UserM', UserMSchema);