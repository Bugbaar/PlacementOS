import { ExtractedProfile, ExtractedProfileSchema } from './schema';

/**
 * Extracts { skills, bullets } from raw text (a resume or a JD).
 *
 * Providers (pick one per process via key presence or RESUME_FIT_PROVIDER):
 *  - Groq / OpenAI / Anthropic / Gemini — LLM JSON extraction
 *  - HeuristicExtractionProvider — offline fallback when no API key is set
 */
export interface ExtractionProvider {
  extract(text: string): Promise<ExtractedProfile>;
}

export type LlmProviderName = 'groq' | 'openai' | 'anthropic' | 'gemini' | 'heuristic';

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

const EXTRACTION_SYSTEM =
  'You extract structured resume/JD data. Return ONLY valid JSON matching { "skills": string[], "bullets": string[] }. No markdown fences, no prose.';

function buildUserPrompt(text: string, extraInstruction?: string): string {
  const parts = [
    'Extract skills and key bullet points from the following text.',
    'skills: normalized technical/professional skills mentioned (lowercase, deduplicated).',
    'bullets: short factual statements from the text useful for judging relevance to a job description.',
    '---',
    text.slice(0, 12000),
  ];
  if (extraInstruction) parts.push('', extraInstruction);
  return parts.join('\n');
}

function parseExtractedJson(raw: string): ExtractedProfile {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const json = jsonMatch ? jsonMatch[0] : raw;
  return ExtractedProfileSchema.parse(JSON.parse(json));
}

async function extractWithRetry(
  generate: (extraInstruction?: string) => Promise<string>,
): Promise<ExtractedProfile> {
  let raw = await generate();
  try {
    return parseExtractedJson(raw);
  } catch {
    raw = await generate(
      'Your previous response was not valid JSON. Return ONLY the JSON object, no prose, no markdown fences.',
    );
    return parseExtractedJson(raw);
  }
}

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

/** Groq chat completions (uses GROQ_API_KEY / GROQ_MODEL). */
export class GroqExtractionProvider implements ExtractionProvider {
  constructor(
    private apiKey: string,
    private model = process.env.GROQ_MODEL?.trim() || 'qwen/qwen3.8-27b',
  ) {}

  async extract(text: string): Promise<ExtractedProfile> {
    const Groq = (await import('groq-sdk')).default;
    const client = new Groq({ apiKey: this.apiKey });

    return extractWithRetry(async (extra) => {
      const response = await client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: EXTRACTION_SYSTEM },
          { role: 'user', content: buildUserPrompt(text, extra) },
        ],
      });
      return response.choices[0]?.message?.content ?? '{}';
    });
  }
}

/** OpenAI chat completions (OPENAI_API_KEY / OPENAI_MODEL). */
export class OpenAIExtractionProvider implements ExtractionProvider {
  constructor(
    private apiKey: string,
    private model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
  ) {}

  async extract(text: string): Promise<ExtractedProfile> {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: this.apiKey });

    return extractWithRetry(async (extra) => {
      const response = await client.chat.completions.create({
        model: this.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: EXTRACTION_SYSTEM },
          { role: 'user', content: buildUserPrompt(text, extra) },
        ],
      });
      return response.choices[0]?.message?.content ?? '{}';
    });
  }
}

/** Anthropic Messages API (ANTHROPIC_API_KEY / ANTHROPIC_MODEL). */
export class AnthropicExtractionProvider implements ExtractionProvider {
  constructor(
    private apiKey: string,
    private model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-haiku-4-5-20251001',
  ) {}

  async extract(text: string): Promise<ExtractedProfile> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: this.apiKey });

    return extractWithRetry(async (extra) => {
      const response = await client.messages.create({
        model: this.model,
        max_tokens: 2048,
        system: EXTRACTION_SYSTEM,
        messages: [{ role: 'user', content: buildUserPrompt(text, extra) }],
      });
      const block = response.content.find((c) => c.type === 'text');
      return block && block.type === 'text' ? block.text : '{}';
    });
  }
}

/** Gemini generateContent (GEMINI_API_KEY / GEMINI_MODEL). */
export class GeminiExtractionProvider implements ExtractionProvider {
  constructor(
    private apiKey: string,
    private model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash',
  ) {}

  async extract(text: string): Promise<ExtractedProfile> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    return extractWithRetry(async (extra) => {
      const response = await ai.models.generateContent({
        model: this.model,
        contents: `${EXTRACTION_SYSTEM}\n\n${buildUserPrompt(text, extra)}`,
      });
      return response.text ?? '{}';
    });
  }
}

function envKey(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function providerFromName(name: LlmProviderName): ExtractionProvider {
  switch (name) {
    case 'groq': {
      const key = envKey('GROQ_API_KEY');
      if (!key) throw new Error('RESUME_FIT_PROVIDER=groq but GROQ_API_KEY is missing');
      return new GroqExtractionProvider(key);
    }
    case 'openai': {
      const key = envKey('OPENAI_API_KEY');
      if (!key) throw new Error('RESUME_FIT_PROVIDER=openai but OPENAI_API_KEY is missing');
      return new OpenAIExtractionProvider(key);
    }
    case 'anthropic': {
      const key = envKey('ANTHROPIC_API_KEY');
      if (!key) throw new Error('RESUME_FIT_PROVIDER=anthropic but ANTHROPIC_API_KEY is missing');
      return new AnthropicExtractionProvider(key);
    }
    case 'gemini': {
      const key = envKey('GEMINI_API_KEY');
      if (!key) throw new Error('RESUME_FIT_PROVIDER=gemini but GEMINI_API_KEY is missing');
      return new GeminiExtractionProvider(key);
    }
    case 'heuristic':
      return new HeuristicExtractionProvider();
    default:
      throw new Error(`Unknown RESUME_FIT_PROVIDER: ${name}`);
  }
}

/**
 * Prefer an explicit RESUME_FIT_PROVIDER, else first available key:
 * Groq → OpenAI → Anthropic → Gemini → offline heuristic.
 */
export function getExtractionProvider(): ExtractionProvider {
  const forced = process.env.RESUME_FIT_PROVIDER?.trim().toLowerCase() as LlmProviderName | undefined;
  if (forced) {
    return providerFromName(forced);
  }

  const groq = envKey('GROQ_API_KEY');
  if (groq) return new GroqExtractionProvider(groq);

  const openai = envKey('OPENAI_API_KEY');
  if (openai) return new OpenAIExtractionProvider(openai);

  const anthropic = envKey('ANTHROPIC_API_KEY');
  if (anthropic) return new AnthropicExtractionProvider(anthropic);

  const gemini = envKey('GEMINI_API_KEY');
  if (gemini) return new GeminiExtractionProvider(gemini);

  return new HeuristicExtractionProvider();
}
