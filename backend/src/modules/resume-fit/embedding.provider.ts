/**
 * Produces a vector for a piece of text, used to rank resume bullets
 * against a job description by cosine similarity.
 *
 * Same pattern as extraction.provider.ts: a real Gemini implementation,
 * and a deterministic offline fallback so the module runs and tests
 * pass without an API key.
 */
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

const VECTOR_DIM = 256;

/**
 * Deterministic bag-of-words hashing embedding. Not semantically rich,
 * but it is stable, dependency-free, and enough to unit-test the
 * ranking logic (cosine similarity, top-K selection) in isolation from
 * embedding quality, which is exactly what those tests are checking.
 */
export class HashingEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const vector = new Array(VECTOR_DIM).fill(0);
    const words = text.toLowerCase().match(/[a-z0-9+.#]+/g) ?? [];

    for (const word of words) {
      const index = this.hash(word) % VECTOR_DIM;
      vector[index] += 1;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / magnitude);
  }

  private hash(word: string): number {
    let h = 0;
    for (let i = 0; i < word.length; i++) {
      h = (h * 31 + word.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  constructor(private apiKey: string, private model = 'gemini-embedding-001') {}

  async embed(text: string): Promise<number[]> {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const response = await ai.models.embedContent({
      model: this.model,
      contents: text.slice(0, 8000),
    });
    return response.embeddings?.[0]?.values ?? [];
  }
}

export function getEmbeddingProvider(): EmbeddingProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return new GeminiEmbeddingProvider(apiKey);
  }
  return new HashingEmbeddingProvider();
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
