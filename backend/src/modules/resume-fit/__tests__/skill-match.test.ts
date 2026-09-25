import { computeSkillMatch } from '../skill-match';

describe('computeSkillMatch', () => {
  it('matches exact skills', () => {
    const result = computeSkillMatch(['react', 'node.js', 'mongodb'], ['react', 'node.js']);
    expect(result.matchedSkills).toEqual(['react', 'node.js']);
    expect(result.missingSkills).toEqual([]);
    expect(result.matchPercentage).toBe(100);
  });

  it('normalizes common aliases before matching', () => {
    const result = computeSkillMatch(['nodejs', 'reactjs', 'mongo'], ['node.js', 'react', 'mongodb']);
    expect(result.matchedSkills.sort()).toEqual(['mongodb', 'node.js', 'react'].sort());
    expect(result.matchPercentage).toBe(100);
  });

  it('fuzzy-matches small typos within the edit-distance threshold', () => {
    const result = computeSkillMatch(['typescrpt'], ['typescript']);
    expect(result.matchedSkills).toEqual(['typescript']);
  });

  it('does not match unrelated skills even if short', () => {
    const result = computeSkillMatch(['java'], ['javascript']);
    expect(result.missingSkills).toEqual(['javascript']);
  });

  it('reports missing skills the resume does not cover', () => {
    const result = computeSkillMatch(['react'], ['react', 'graphql', 'docker']);
    expect(result.matchedSkills).toEqual(['react']);
    expect(result.missingSkills.sort()).toEqual(['docker', 'graphql'].sort());
    expect(result.matchPercentage).toBe(33);
  });

  it('returns 0% match when the JD has no extracted skills', () => {
    const result = computeSkillMatch(['react'], []);
    expect(result.matchPercentage).toBe(0);
  });

  it('handles an empty resume skill list without throwing', () => {
    const result = computeSkillMatch([], ['react', 'node.js']);
    expect(result.matchedSkills).toEqual([]);
    expect(result.matchPercentage).toBe(0);
  });
});
