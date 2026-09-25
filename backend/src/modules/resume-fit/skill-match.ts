import { distance } from 'fastest-levenshtein';
import { SkillMatchResult } from './schema';

/**
 * Why fuzzy string matching here instead of embeddings:
 * skill names are short, mostly single tokens ("node.js" vs "nodejs" vs
 * "node"), and the failure mode we care about is spelling/formatting
 * variance, not semantic similarity. Levenshtein distance on a small
 * alias-normalized vocabulary is cheap, fully deterministic, and easy
 * to unit test. Embeddings are reserved for the bullet-retrieval step
 * below, where we do need semantic similarity (a JD line and a resume
 * bullet rarely share exact wording).
 */
const SKILL_ALIASES: Record<string, string> = {
  'node': 'node.js',
  'nodejs': 'node.js',
  'reactjs': 'react',
  'react.js': 'react',
  'expressjs': 'express',
  'express.js': 'express',
  'postgres': 'postgresql',
  'js': 'javascript',
  'ts': 'typescript',
  'mongo': 'mongodb',
  'tailwind': 'tailwindcss',
  'k8s': 'kubernetes',
};

function normalize(skill: string): string {
  const cleaned = skill.trim().toLowerCase();
  return SKILL_ALIASES[cleaned] ?? cleaned;
}

const FUZZY_MATCH_THRESHOLD = 2; // max edit distance to count as a match

function isFuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > FUZZY_MATCH_THRESHOLD) return false;
  return distance(a, b) <= FUZZY_MATCH_THRESHOLD;
}

export function computeSkillMatch(resumeSkills: string[], jdSkills: string[]): SkillMatchResult {
  const normalizedResumeSkills = resumeSkills.map(normalize);
  const normalizedJdSkills = Array.from(new Set(jdSkills.map(normalize)));

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jdSkill of normalizedJdSkills) {
    const hasMatch = normalizedResumeSkills.some((resumeSkill) => isFuzzyMatch(resumeSkill, jdSkill));
    if (hasMatch) {
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  }

  const matchPercentage = normalizedJdSkills.length === 0
    ? 0
    : Math.round((matchedSkills.length / normalizedJdSkills.length) * 100);

  return { matchedSkills, missingSkills, matchPercentage };
}
