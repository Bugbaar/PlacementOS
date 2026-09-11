import { retrieveTopRelevantBullets } from '../bullet-retrieval';
import { HashingEmbeddingProvider } from '../embedding.provider';

describe('retrieveTopRelevantBullets', () => {
  const provider = new HashingEmbeddingProvider();

  it('ranks bullets more relevant to the JD higher', async () => {
    const bullets = [
      'Organized a college cultural fest with a 500-person budget',
      'Built and deployed a REST API using Node.js, Express, and MongoDB',
      'Designed React components with Redux Toolkit for state management',
    ];
    const jd = 'Looking for a backend engineer skilled in Node.js, Express, and MongoDB REST APIs';

    const results = await retrieveTopRelevantBullets(bullets, jd, provider, 2);

    expect(results).toHaveLength(2);
    expect(results[0].bullet).toContain('REST API using Node.js');
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });

  it('returns an empty array when there are no bullets', async () => {
    const results = await retrieveTopRelevantBullets([], 'some JD text here', provider);
    expect(results).toEqual([]);
  });

  it('respects the topK limit', async () => {
    const bullets = Array.from({ length: 10 }, (_, i) => `Bullet number ${i} about various things`);
    const results = await retrieveTopRelevantBullets(bullets, 'a job description', provider, 3);
    expect(results).toHaveLength(3);
  });
});
