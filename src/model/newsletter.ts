import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}

const NewsletterSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // Creates a database index for speed and prevents duplicates
    trim: true,   // Removes whitespace from both ends
    lowercase: true, // Stores all emails in lowercase to avoid case-sensitivity issues
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] // Basic structural check
  },
  isActive: {
    type: Boolean,
    default: true // Easily toggle off for unsubscribes without deleting record
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Cache the model to prevent OverwriteModelError in Next.js/serverless environments
export default mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);