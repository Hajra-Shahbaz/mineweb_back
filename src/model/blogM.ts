import { Schema, model, Document } from 'mongoose';

export interface IBlogM extends Document {
  title: string;
  slug: string;           // URL-friendly title, e.g., "mastering-react-in-2026"
  content: string;        // The actual text/markdown body of the article
  tags: string[];         // e.g., ["React", "JavaScript"]
  coverImageUrl?: string; // Optional banner image from S3 (can be skipped)
}

const BlogMSchema = new Schema<IBlogM>({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  tags: { 
    type: [String], 
    default: [] 
  },
  coverImageUrl: { 
    type: String, 
    default: "" // Optional; falls back to an empty string if skipped
  }
}, { 
  timestamps: true // Automatically gives you createdAt (Publish Date) and updatedAt
});

export const BlogM = model<IBlogM>('BlogM', BlogMSchema);