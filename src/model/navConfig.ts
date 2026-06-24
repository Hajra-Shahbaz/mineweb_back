import { Schema, model, Document } from 'mongoose';

// Interfaces remain the same
export interface IAdminNav {
  id: string;
  label: string;
  iconName: string;
  isWorking: boolean;
}

export interface IUserNav {
  id: string;
  label: string;
  iconName: string;
  isVisible: boolean;
  children?: IUserNav[];
  route?: string; // Added route property
  isPage?: boolean; // Added to identify if this is a page route
}

export interface INavConfig extends Document {
  adminNav: IAdminNav[];
  userNav: IUserNav[];
  createdAt: string;
  updatedAt: string;
}

const AdminNavSchema = new Schema<IAdminNav>({
  id: { type: String, required: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  iconName: { type: String, required: true, default: 'LayoutDashboard' },
  isWorking: { type: Boolean, default: true }
}, { _id: false });

const UserNavSchema = new Schema<IUserNav>({
  id: { type: String, required: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  iconName: { type: String, required: true, default: 'LayoutDashboard' },
  isVisible: { type: Boolean, default: true },
  route: { type: String, trim: true }, // Added route field
  isPage: { type: Boolean, default: false } // Added isPage field
}, { _id: false });

// Crucial: Add the children field recursively to the schema definition
UserNavSchema.add({
  children: [UserNavSchema]
});

// Core Model configuration
const NavConfigSchema = new Schema<INavConfig>({
  // Use array notation directly, NOT { type: [...] }
  adminNav: [AdminNavSchema],
  userNav: [UserNavSchema]
}, { 
  timestamps: true 
});

export const NavConfig = model<INavConfig>('NavConfig', NavConfigSchema);
