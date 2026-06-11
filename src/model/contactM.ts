import { Schema, model, Document } from 'mongoose';

export interface IContactM extends Document {
  name: string;        // Visitor's name
  email: string;       // Visitor's email address
  mineEmail: string; // Your email address (Admin/Owner)
  phoneNumber?: string; 
  subject: string; 
  message: string;
  isRead: boolean;  
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
mineEmail: { 
    type: String, 
    required: true, 
    trim: true,
    lowercase: true
  },
  phoneNumber: { 
    type: String,
    required: false, 
    trim: true
  },
  subject: { 
    type: String, 
    required: true, 
    trim: true
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

export const ContactM = model<IContactM>('ContactM', ContactMSchema);