import mongoose from 'mongoose';
import { getExtractionProvider } from './extraction.provider';
import { getEmbeddingProvider } from './embedding.provider';
import { computeSkillMatch } from './skill-match';
import { retrieveTopRelevantBullets } from './bullet-retrieval';
import { ResumeFitResponse } from './schema';
import { ResumeFitResult } from './resumeFit.model';

/**
 * End-to-end pipeline for one resume-fit request:
 *  1. Extract { skills, bullets } from the resume text and from the JD
 *     (structured LLM extraction, or the offline heuristic fallback).
 *  2. Lexical skill match (fuzzy string matching) -> matchPercentage,
 *     matchedSkills, missingSkills.
 *  3. Semantic bullet retrieval (embeddings + cosine similarity) -> the
 *     resume bullets most relevant to this specific JD.
 *  4. Persist the result and return it.
 *
 * Split into its own function (rather than living in the controller) so
 * it can be unit-tested without spinning up Express or a real Mongo
 * connection.
 */
export async function runResumeFitAnalysis(
  resumeText: string,
  jobDescription: string,
  options: { persist?: boolean } = { persist: true },
): Promise<ResumeFitResponse> {
  const extractionProvider = getExtractionProvider();
  const embeddingProvider = getEmbeddingProvider();

  const [resumeProfile, jdProfile] = await Promise.all([
    extractionProvider.extract(resumeText),
    extractionProvider.extract(jobDescription),
  ]);

  const { matchedSkills, missingSkills, matchPercentage } = computeSkillMatch(
    resumeProfile.skills,
    jdProfile.skills,
  );

  const topRelevantBullets = await retrieveTopRelevantBullets(
    resumeProfile.bullets,
    jobDescription,
    embeddingProvider,
  );

  const response: ResumeFitResponse = {
    matchPercentage,
    matchedSkills,
    missingSkills,
    topRelevantBullets,
    extractedResumeSkillCount: resumeProfile.skills.length,
    extractedJdSkillCount: jdProfile.skills.length,
  };

  // Persistence is a nice-to-have for this endpoint, not a correctness
  // requirement. Checking readyState up front (rather than just
  // try/catching the write) matters: Mongoose buffers writes and only
  // times out after ~10s when there's no connection at all, which would
  // otherwise make every request slow whenever MONGODB_URI isn't set
  // (e.g. running the module standalone, or in CI).
  if (options.persist && mongoose.connection.readyState === 1) {
    try {
      await ResumeFitResult.create({
        jobDescription,
        ...response,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Could not persist ResumeFitResult:', error instanceof Error ? error.message : error);
    }
  }

  return response;
}
