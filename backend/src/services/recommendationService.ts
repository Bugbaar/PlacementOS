import { IStudent } from '../models/Student';
import Opportunity, { IOpportunity } from '../models/Opportunity';
import { calculateMatchScore, MatchResult } from './matchingService';

export interface RecommendationResponse extends MatchResult {
  opportunity: IOpportunity;
}

export const getRecommendations = async (
  student: IStudent,
  page: number = 1,
  limit: number = 10,
  minScore: number = 0
): Promise<{ data: RecommendationResponse[]; total: number; totalPages: number }> => {
  // Fetch active and non-expired opportunities
  const now = new Date();
  const activeOpportunities = await Opportunity.find({
    status: 'active',
    applicationDeadline: { $gt: now },
  }).exec();

  const recommendations: RecommendationResponse[] = [];

  for (const opp of activeOpportunities) {
    const matchResult = calculateMatchScore(student, opp);

    // Only include eligible opportunities as recommendations
    if (matchResult.eligible && matchResult.matchScore >= minScore) {
      recommendations.push({
        ...matchResult,
        opportunity: opp,
      });
    }
  }

  // Sort by match score descending
  recommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = recommendations.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: recommendations.length,
    totalPages: Math.ceil(recommendations.length / limit),
  };
};
