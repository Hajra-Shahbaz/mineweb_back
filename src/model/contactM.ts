import { Schema, model, Document } from 'mongoose';

// 1. Enum for Priority Levels
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

// 2. Enum for Message Categories (for auto-sorting)
export type MessageCategory = 'general' | 'project_inquiry' | 'feedback' | 'bug_report' | 'other';

export interface IContactM extends Document {
  name: string;        // Visitor's name
  email: string;       // Visitor's email address
  phoneNumber?: string; 
  subject: string; 
  message: string;
  isRead: boolean;  
  priority: PriorityLevel;      // 🔥 Added: Dynamic priority scaling
  category: MessageCategory;  // 🔥 Added: Automatic or manual categorization
  isArchived: boolean;        // 🔥 Added: To clear your main inbox without deleting data
  notes?: string;             // 🔥 Added: Admin-only internal notes for follow-ups
  createdAt: Date;
  updatedAt: Date;
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
  },
  // 🔥 New Amazing Additions:
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['general', 'project_inquiry', 'feedback', 'bug_report', 'other'],
    default: 'general'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    required: false
  }
}, { 
  timestamps: true 
});

// 🚀 Indexing for lightning-fast dashboard queries (Read vs Unread, High Priority)
ContactMSchema.index({ isRead: 1, priority: -1 });
ContactMSchema.index({ isArchived: 1 });

export const ContactM = model<IContactM>('ContactM', ContactMSchema);