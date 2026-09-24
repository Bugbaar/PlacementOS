import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  opportunityId: mongoose.Types.ObjectId;
  status: 'saved' | 'applied' | 'shortlisted' | 'interview' | 'rejected' | 'offered' | 'accepted';
  notes?: string;
  appliedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'shortlisted', 'interview', 'rejected', 'offered', 'accepted'],
      default: 'saved',
    },
    notes: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only have one application per opportunity
ApplicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
