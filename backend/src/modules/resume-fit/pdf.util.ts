import multer from 'multer';
import { createRequire } from 'node:module';

const require = createRequire(__filename);
// Load implementation directly to avoid pdf-parse root debug side-effect.
const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (
  buf: Buffer
) => Promise<{ text: string }>;

/**
 * 5MB limit, PDF mimetype only. Same constraint Calibrate uses; resumes
 * are small text-heavy PDFs, and this keeps the upload surface narrow
 * (no arbitrary file uploads to parse).
 */
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('Only PDF files are accepted'));
      return;
    }
    callback(null, true);
  },
});

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}
