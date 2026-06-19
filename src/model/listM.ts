import mongoose, { Document, Model, Schema } from 'mongoose';

// 1. TypeScript Interface
export interface ITask extends Document {
  subject: string;
  desc?: string;
  currentDate: string; 
  deadline: string;    
  startTime?: string;      // Expected format: "HH:mm" or full ISO string
  endTime?: string;        // Expected format: "HH:mm" or full ISO string
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  timeLeft: string;        // Virtual field (calculated on the fly)
}

// 2. Mongoose Schema
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
    startTime: {
      type: String,
      trim: true,
      default: ''
    },
    endTime: {
      type: String,
      trim: true,
      default: ''
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority level'
      },
      default: 'medium',
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    // Crucial: This ensures virtual fields are included when converting to JSON or Objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 3. Virtual Property to calculate Time Left dynamically
TaskSchema.virtual('timeLeft').get(function (this: ITask) {
  if (this.isCompleted) return 'Completed';
  
  // Combines deadline date with endTime if available, otherwise defaults to end of day
  const targetDateTimeStr = this.endTime ? `${this.deadline} ${this.endTime}` : this.deadline;
  const deadlineTime = new Date(targetDateTimeStr).getTime();
  const now = new Date().getTime();
  
  const difference = deadlineTime - now;
  
  if (difference <= 0) {
    return 'Overdue';
  }
  
  // Simple conversion math to human-readable string
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
});

// 4. Compile and Export the Model
export const TaskModel: Model<ITask> = 
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default TaskModel;