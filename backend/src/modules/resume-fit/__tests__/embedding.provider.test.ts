import { HashingEmbeddingProvider, cosineSimilarity } from '../embedding.provider';

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('returns 0 when either vector is empty instead of throwing', () => {
    expect(cosineSimilarity([], [1, 2])).toBe(0);
  });
});

describe('HashingEmbeddingProvider', () => {
  const provider = new HashingEmbeddingProvider();

  it('produces a unit-length vector', async () => {
    const vector = provider.embed !== undefined ? await provider.embed('some sample text') : [];
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('gives near-identical text higher similarity than unrelated text', async () => {
    const base = await provider.embed('built a REST API with Node.js and Express for order management');
    const similar = await provider.embed('built a REST API using Node.js and Express to manage orders');
    const unrelated = await provider.embed('painted a mural for the community art festival');

    const simScore = cosineSimilarity(base, similar);
    const unrelatedScore = cosineSimilarity(base, unrelated);

    expect(simScore).toBeGreaterThan(unrelatedScore);
  });

  it('is deterministic for the same input', async () => {
    const a = await provider.embed('deterministic check');
    const b = await provider.embed('deterministic check');
    expect(a).toEqual(b);
  });
});
