import { Schema, model, Document } from 'mongoose';

// Structure for Admin-specific Navigation nodes
export interface IAdminNav {
  id: string;        // Routing lookup target (e.g., 'messages')
  label: string;     // Text rendering string (e.g., 'Inbox Management')
  iconName: string;  // Lucide React icon token label string
  isWorking: boolean; // Custom operational flag for development tracking
}

// Structure for User/Display-specific Navigation nodes
export interface IUserNav {
  id: string;        // Routing lookup target (e.g., 'education')
  label: string;     // Text rendering string (e.g., 'Education')
  iconName: string;  // Lucide React icon token label string
  isVisible: boolean; // Visibility toggle master switch rule
}

// Complete Master Layout Document Interface
export interface INavConfig extends Document {
  adminNav: IAdminNav[];
  userNav: IUserNav[];
  createdAt: string;
  updatedAt: string;
}

// Sub-schema definitions for structured verification validation
const AdminNavSchema = new Schema<IAdminNav>({
  id: { type: String, required: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  iconName: { type: String, required: true, default: 'LayoutDashboard' },
  isWorking: { type: Boolean, default: true }
}, { _id: false }); // Prevents mongoose from generating nested sub-document ObjectIds

const UserNavSchema = new Schema<IUserNav>({
  id: { type: String, required: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  iconName: { type: String, required: true, default: 'LayoutDashboard' },
  isVisible: { type: Boolean, default: true }
}, { _id: false });

// Core Model configuration layout mapping
const NavConfigSchema = new Schema<INavConfig>({
  adminNav: { type: [AdminNavSchema], default: [] },
  userNav: { type: [UserNavSchema], default: [] }
}, { 
  timestamps: true // Tracks global updates to configuration sequences
});

export const NavConfig = model<INavConfig>('NavConfig', NavConfigSchema);