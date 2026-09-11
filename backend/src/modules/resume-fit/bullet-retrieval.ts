import { EmbeddingProvider, cosineSimilarity } from './embedding.provider';
import { BulletMatch } from './schema';

/**
 * Ranks resume bullets by relevance to a job description using
 * embedding cosine similarity. This is the semantic-matching half of
 * the module (skill-match.ts handles the lexical half). Kept as a pure
 * function over an injected EmbeddingProvider so it's testable without
 * network calls.
 */
export async function retrieveTopRelevantBullets(
  bullets: string[],
  jobDescription: string,
  embeddingProvider: EmbeddingProvider,
  topK = 5,
): Promise<BulletMatch[]> {
  if (bullets.length === 0) return [];

  const jdVector = await embeddingProvider.embed(jobDescription);

  const scored: BulletMatch[] = [];
  for (const bullet of bullets) {
    const bulletVector = await embeddingProvider.embed(bullet);
    scored.push({ bullet, score: cosineSimilarity(jdVector, bulletVector) });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
