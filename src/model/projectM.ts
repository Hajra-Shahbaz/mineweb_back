import { Schema, model, Document } from 'mongoose';

export interface IProjectM extends Document {
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  order: number;
  isHidden: boolean;
  isWorking: boolean;
}

// Using type assertion to bypass strict TypeScript checking
const ProjectMSchema = new Schema<IProjectM>(
  {
    title: {
      type: String as any,
      required: [true, 'Title is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String as any,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long']
    },
    techStack: {
      type: [String] as any,
      required: [true, 'Tech stack is required'],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0,
        message: 'Tech stack must contain at least one technology'
      }
    },
    liveUrl: {
      type: String as any,
      trim: true
    },
    githubUrl: {
      type: String as any,
      trim: true
    },
    imageUrl: {
      type: String as any,
      default: '',
      trim: true
    },
    order: {
      type: Number as any,
      default: 0
    },
    isHidden: {
      type: Boolean as any,
      default: false
    },
    isWorking: {
      type: Boolean as any,
      default: true
    }
  },
  {
    timestamps: true
  }
);

ProjectMSchema.pre('save', async function (this: IProjectM, next) {
  if (this.isNew) {
    try {
      const count = await ProjectM.countDocuments();
      this.order = count;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const ProjectM = model<IProjectM>('ProjectM', ProjectMSchema);