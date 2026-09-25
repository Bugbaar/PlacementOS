import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  minimumCgpa: number;
  eligibleBranches: string[];
  eligibleGraduationYears: number[];
  location: string;
  employmentType: string; // Full-time, Internship, etc.
  experienceLevel?: string;
  salaryRange?: string;
  applicationDeadline: Date;
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    minimumCgpa: { type: Number, required: true, min: 0, max: 10, default: 0 },
    eligibleBranches: [{ type: String }],
    eligibleGraduationYears: [{ type: Number }],
    location: { type: String, required: true },
    employmentType: { type: String, required: true },
    experienceLevel: { type: String },
    salaryRange: { type: String },
    applicationDeadline: { type: Date, required: true },
    status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

// Normalize requiredSkills on save
OpportunitySchema.pre<IOpportunity>('save', function () {
  if (this.requiredSkills) {
    this.requiredSkills = Array.from(
      new Set(this.requiredSkills.map((s) => s.toLowerCase().trim()))
    );
  }
});

export default mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
