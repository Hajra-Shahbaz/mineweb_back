import { Schema, model, Document } from 'mongoose';

export interface IContactM extends Document {
  name: string;
  email: string;
  subject?: string; // Optional field in case they just want to send a quick note
  message: string;
  isRead: boolean;  // Tracks if you've opened/reviewed this message in your admin dashboard
}

const ContactMSchema = new Schema<IContactM>({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true
  },
  subject: { 
    type: String, 
    trim: true,
    default: "No Subject Specified"
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false // Messages start as unread automatically
  }
}, { 
  timestamps: true // Tracks exactly when the client submitted the form (createdAt)
});

export const ContactM = model<IContactM>('ContactM', ContactMSchema);