import { ExtractedProfile, ExtractedProfileSchema } from './schema';

/**
 * Extracts { skills, bullets } from raw text (a resume or a JD).
 *
 * Two implementations:
 *  - GeminiExtractionProvider: calls Gemini with the Zod schema converted
 *    to a JSON schema, retries once on invalid JSON (same pattern used in
 *    Calibrate).
 *  - HeuristicExtractionProvider: a zero-dependency fallback that runs
 *    entirely offline, used automatically when GEMINI_API_KEY is not set.
 *    This keeps `npm test` and local dev working for anyone who clones
 *    the repo without needing to provision an API key first.
 */
export interface ExtractionProvider {
  extract(text: string): Promise<ExtractedProfile>;
}

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c',
  'react', 'react.js', 'next.js', 'node.js', 'node', 'express', 'express.js',
  'mongodb', 'mongoose', 'postgresql', 'postgres', 'mysql', 'redis',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd',
  'graphql', 'rest api', 'rest', 'jwt', 'oauth', 'socket.io',
  'redux', 'tailwind', 'tailwindcss', 'html', 'css', 'sass',
  'git', 'github actions', 'jest', 'mocha', 'testing',
  'machine learning', 'nlp', 'llm', 'embeddings', 'rag', 'vector database',
  'pandas', 'numpy', 'tensorflow', 'pytorch',
];

/**
 * Offline heuristic extractor: lowercases the text, matches against a
 * known skill vocabulary, and splits into bullet-like lines for the
 * "bullets" field. Deliberately simple; it exists so this module has
 * zero external dependencies to run, not to compete with the LLM path
 * on extraction quality.
 */
export class HeuristicExtractionProvider implements ExtractionProvider {
  async extract(text: string): Promise<ExtractedProfile> {
    const lower = text.toLowerCase();
    const skills = COMMON_SKILLS.filter((skill) => lower.includes(skill));

    const bullets = text
      .split(/\n|(?<=[.])\s+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 15 && line.length < 300);

    return ExtractedProfileSchema.parse({
      skills: Array.from(new Set(skills)),
      bullets: bullets.slice(0, 25),
    });
  }
}

/**
 * Gemini-backed extractor. Mirrors the approach used in Calibrate:
 * structured extraction against a JSON schema, one retry with a
 * corrective instruction if the model returns invalid JSON.
 */
export class GeminiExtractionProvider implements ExtractionProvider {
  constructor(private apiKey: string, private model = 'gemini-2.0-flash') {}

  async extract(text: string): Promise<ExtractedProfile> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const prompt = [
      'Extract skills and key bullet points from the following text.',
      'Return ONLY valid JSON matching this shape: { "skills": string[], "bullets": string[] }.',
      'skills: normalized technical/professional skills mentioned (lowercase, deduplicated).',
      'bullets: short factual statements from the text useful for judging relevance to a job description.',
      '---',
      text.slice(0, 12000),
    ].join('\n');

    const attempt = async (extraInstruction?: string) => {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: extraInstruction ? `${prompt}\n\n${extraInstruction}` : prompt,
      });
      const raw = response.text ?? '{}';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      return jsonMatch ? jsonMatch[0] : raw;
    };

    let raw = await attempt();
    try {
      return ExtractedProfileSchema.parse(JSON.parse(raw));
    } catch {
      raw = await attempt('Your previous response was not valid JSON. Return ONLY the JSON object, no prose, no markdown fences.');
      return ExtractedProfileSchema.parse(JSON.parse(raw));
    }
  }
}

export function getExtractionProvider(): ExtractionProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return new GeminiExtractionProvider(apiKey);
  }
  return new HeuristicExtractionProvider();
}
