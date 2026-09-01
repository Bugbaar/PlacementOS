import mongoose, { Document, Schema } from 'mongoose';

export const placementStatuses = ['Not Placed', 'Placed', 'Seeking Opportunity'] as const;

export type PlacementStatus = (typeof placementStatuses)[number];

export interface IStudent extends Document {
  name: string;
  email: string;
  phone?: string;
  college?: string;
  course?: string;
  graduationYear?: number;
  skills: string[];
  placementStatus: PlacementStatus;
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      trim: true
    },
    course: {
      type: String,
      trim: true
    },
    graduationYear: {
      type: Number,
      min: [2000, 'Graduation year must be 2000 or later'],
      max: [2100, 'Graduation year must be 2100 or earlier']
    },
    skills: {
      type: [String],
      default: []
    },
    placementStatus: {
      type: String,
      enum: placementStatuses,
      default: 'Seeking Opportunity'
    }
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>('Student', studentSchema);
