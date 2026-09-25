import multer from 'multer';

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
  // Lazy import: pdf-parse has a debug-mode side effect on import in some
  // versions when run outside its own package directory; importing lazily
  // keeps that contained to the one place it's actually used.
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return result.text;
}
