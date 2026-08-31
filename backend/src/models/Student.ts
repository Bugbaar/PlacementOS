import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  phone?: string;
  branch: string;
  college: string;
  cgpa: number;
  graduationYear: number;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  experienceLevel?: string;
  resumeUrl?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    branch: { type: String, required: true },
    college: { type: String, required: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    graduationYear: { type: Number, required: true },
    skills: [{ type: String }],
    preferredRoles: [{ type: String }],
    preferredLocations: [{ type: String }],
    experienceLevel: { type: String },
    resumeUrl: { type: String },
    bio: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    portfolioUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Normalize skills on save
StudentSchema.pre<IStudent>('save', function () {
  if (this.skills) {
    this.skills = Array.from(new Set(this.skills.map((s) => s.toLowerCase().trim())));
  }
});

export default mongoose.model<IStudent>('Student', StudentSchema);
