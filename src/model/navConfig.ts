import { Schema, model, Document } from 'mongoose';

export interface INavItem extends Document {
  id: string;        // Used for routing logic matching (e.g., 'education')
  label: string;     // Text display (e.g., 'Education Management')
  iconName: string;  // Matches Lucide React component string tokens (e.g., 'GraduationCap')
  isVisible: boolean;// Visibility master rule flag
}

const NavItemSchema = new Schema<INavItem>({
  id: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true },
  iconName: { type: String, required: true, default: 'LayoutDashboard' },
  isVisible: { type: Boolean, default: true }
});

export const NavConfig = model<INavItem>('NavConfig', NavItemSchema);