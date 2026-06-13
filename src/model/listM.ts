import mongoose, { Document, Model, Schema } from 'mongoose';

// 1. TypeScript Interface detailing the structural layout configuration
export interface ITask extends Document {
  subject: string;
  desc?: string;
  currentDate: string; // Stored as a clean display date string
  deadline: string;    // Stored as an input date string
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema defining the system constraints
const TaskSchema: Schema<ITask> = new Schema<ITask>(
  {
    subject: {
      type: String,
      required: [true, 'Task subject heading definition is completely required'],
      trim: true,
      maxlength: [150, 'Subject heading cannot exceed 150 characters']
    },
    desc: {
      type: String,
      trim: true,
      default: ''
    },
    currentDate: {
      type: String,
      required: [true, 'Creation date log anchor is required']
    },
    deadline: {
      type: String,
      required: [true, 'Target milestone target deadline string picker is required']
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // Auto-manages database-level createdAt and updatedAt timestamps
  }
);

// 3. Compile and Export the Model safely handling hot-reloads
export const TaskModel: Model<ITask> = 
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default TaskModel;