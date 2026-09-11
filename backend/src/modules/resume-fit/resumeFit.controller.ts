import { Router, Request, Response } from 'express';
import { resumeUpload, extractTextFromPdf } from './pdf.util';
import { ResumeFitRequestSchema } from './schema';
import { runResumeFitAnalysis } from './resumeFit.service';

export const resumeFitRouter = Router();

/**
 * POST /api/resume-fit
 * multipart/form-data:
 *   - resume: PDF file (required, max 5MB)
 *   - jobDescription: string (required, min 20 chars)
 */
resumeFitRouter.post(
  '/',
  resumeUpload.single('resume'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'resume file is required' });
      }

      const parsed = ResumeFitRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
      }

      let resumeText: string;
      try {
        resumeText = await extractTextFromPdf(req.file.buffer);
      } catch {
        // A malformed/corrupt PDF is a client-input problem, not a server
        // fault, distinct from the 500s below (unexpected extraction/
        // embedding provider errors).
        return res.status(422).json({ error: 'Could not parse the uploaded PDF file' });
      }

      if (!resumeText || resumeText.trim().length === 0) {
        return res.status(422).json({ error: 'Could not extract any text from the uploaded PDF' });
      }

      const result = await runResumeFitAnalysis(resumeText, parsed.data.jobDescription);
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  },
);
