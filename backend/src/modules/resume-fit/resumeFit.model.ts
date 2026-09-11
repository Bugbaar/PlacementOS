import { Schema, model, Document } from 'mongoose';

export interface ResumeFitResultDocument extends Document {
  jobDescription: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  topRelevantBullets: { bullet: string; score: number }[];
  createdAt: Date;
}

const ResumeFitResultSchema = new Schema<ResumeFitResultDocument>({
  jobDescription: { type: String, required: true },
  matchPercentage: { type: Number, required: true },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  topRelevantBullets: {
    type: [{ bullet: String, score: Number }],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

export const ResumeFitResult = model<ResumeFitResultDocument>(
  'ResumeFitResult',
  ResumeFitResultSchema,
);
