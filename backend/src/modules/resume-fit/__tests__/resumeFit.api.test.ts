import request from 'supertest';
import { createApp } from '../../../app';
import { signToken } from '../../../utils/jwt';
import { buildFixturePdf } from '../__tests__/fixtures';

// API tests must stay offline — do not hit live LLMs even if .env has keys.
delete process.env.GROQ_API_KEY;
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.GEMINI_API_KEY;
delete process.env.RESUME_FIT_PROVIDER;

describe('POST /api/resume-fit', () => {
  const app = createApp();
  const authHeader = `Bearer ${signToken({
    id: 'test-student-id',
    role: 'student',
    email: 'student@example.com',
  })}`;

  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/resume-fit')
      .field('jobDescription', 'A job description that is definitely long enough.');

    expect(response.status).toBe(401);
  });

  it('returns a match analysis for a valid PDF resume and job description', async () => {
    const pdfBuffer = await buildFixturePdf(
      'Jane Doe\nBuilt a REST API using Node.js, Express, and MongoDB for an e-commerce platform\nDesigned React components with Redux Toolkit\nSkills: JavaScript, TypeScript, Node.js, Express, MongoDB, React',
    );

    const response = await request(app)
      .post('/api/resume-fit')
      .set('Authorization', authHeader)
      .field('jobDescription', 'We need a backend engineer experienced in Node.js, Express, and MongoDB to build REST APIs.')
      .attach('resume', pdfBuffer, 'resume.pdf');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('matchPercentage');
    expect(response.body).toHaveProperty('matchedSkills');
    expect(response.body).toHaveProperty('missingSkills');
    expect(response.body).toHaveProperty('topRelevantBullets');
    expect(typeof response.body.matchPercentage).toBe('number');
    expect(Array.isArray(response.body.topRelevantBullets)).toBe(true);
  });

  it('rejects a request with no resume file', async () => {
    const response = await request(app)
      .post('/api/resume-fit')
      .set('Authorization', authHeader)
      .field('jobDescription', 'A job description that is definitely long enough.');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/resume file is required/i);
  });

  it('rejects a request with a job description shorter than 20 characters', async () => {
    const pdfBuffer = await buildFixturePdf('Some resume content here.');

    const response = await request(app)
      .post('/api/resume-fit')
      .set('Authorization', authHeader)
      .field('jobDescription', 'too short')
      .attach('resume', pdfBuffer, 'resume.pdf');

    expect(response.status).toBe(400);
  });

  it('rejects a non-PDF file upload', async () => {
    const response = await request(app)
      .post('/api/resume-fit')
      .set('Authorization', authHeader)
      .field('jobDescription', 'A job description that is definitely long enough.')
      .attach('resume', Buffer.from('not a pdf'), { filename: 'resume.txt', contentType: 'text/plain' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/only pdf files/i);
  });

  it('returns 422 when the PDF contains no extractable text', async () => {
    const { PDFDocument } = await import('pdf-lib');
    const emptyDoc = await PDFDocument.create();
    emptyDoc.addPage([200, 200]);
    const emptyBuffer = Buffer.from(await emptyDoc.save());

    const response = await request(app)
      .post('/api/resume-fit')
      .set('Authorization', authHeader)
      .field('jobDescription', 'A job description that is definitely long enough.')
      .attach('resume', emptyBuffer, 'blank.pdf');

    expect(response.status).toBe(422);
  });
});
