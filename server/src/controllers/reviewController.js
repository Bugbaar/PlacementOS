import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const POSITIVE_WORDS = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
  'best', 'love', 'happy', 'satisfied', 'recommend', 'perfect', 'outstanding',
  'supportive', 'growth', 'learning', 'culture', 'balance', 'flexible', 'innovative',
];

const NEGATIVE_WORDS = [
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'disappointed',
  'poor', 'slow', 'stressful', 'toxic', 'boring', 'outdated', 'micromanagement',
  'overwork', 'underpaid', 'unfair', 'politics', 'bureaucracy', 'layoff',
];

const analyzeSentiment = (text) => {
  if (!text) return { score: 0, label: 'neutral', confidence: 0 };
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    if (POSITIVE_WORDS.some(pw => word.includes(pw))) positiveCount++;
    if (NEGATIVE_WORDS.some(nw => word.includes(nw))) negativeCount++;
  }
  
  const total = positiveCount + negativeCount;
  if (total === 0) return { score: 0, label: 'neutral', confidence: 0 };
  
  const score = (positiveCount - negativeCount) / total;
  const confidence = Math.min(1, total / words.length * 5);
  
  let label = 'neutral';
  if (score > 0.2) label = 'positive';
  if (score < -0.2) label = 'negative';
  
  return { score: parseFloat(score.toFixed(2)), label, confidence: parseFloat(confidence.toFixed(2)) };
};

const addCompanyReview = asyncHandler(async (req, res) => {
  const { companyId, rating, review, pros, cons, workLifeBalance, culture } = req.body;
  
  if (!companyId || !rating) {
    throw new ApiError(400, 'Company ID and rating are required.');
  }
  
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5.');
  }
  
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }
  
  const sentiment = analyzeSentiment(review);
  
  const reviewRecord = await prisma.companyReview.create({
    data: {
      companyId,
      userId: req.user.id,
      rating,
      review: review || '',
      pros: pros || '',
      cons: cons || '',
      workLifeBalance: workLifeBalance || null,
      culture: culture || null,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.label,
    },
  });
  
  return res.status(201).json(new ApiResponse(201, reviewRecord, 'Review added successfully'));
});

const getCompanyReviews = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const { page = 1, limit = 10, sentiment } = req.query;
  
  const where = { companyId };
  if (sentiment) where.sentimentLabel = sentiment;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [reviews, total, stats] = await Promise.all([
    prisma.companyReview.findMany({
      where,
      include: { user: { select: { name: true, avatar: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.companyReview.count({ where }),
    prisma.companyReview.groupBy({
      by: ['sentimentLabel'],
      where: { companyId },
      _count: { sentimentLabel: true },
      _avg: { rating: true },
    }),
  ]);
  
  const sentimentStats = {
    positive: stats.find(s => s.sentimentLabel === 'positive')?._count?.sentimentLabel || 0,
    negative: stats.find(s => s.sentimentLabel === 'negative')?._count?.sentimentLabel || 0,
    neutral: stats.find(s => s.sentimentLabel === 'neutral')?._count?.sentimentLabel || 0,
    averageRating: stats[0]?._avg?.rating?.toFixed(1) || 0,
  };
  
  return res.status(200).json(new ApiResponse(200, {
    reviews,
    stats: sentimentStats,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Company reviews retrieved'));
});

const getCompanySentimentSummary = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  
  const reviews = await prisma.companyReview.findMany({
    where: { companyId },
    select: { rating: true, sentimentScore: true, sentimentLabel: true },
  });
  
  if (reviews.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      totalReviews: 0,
      averageRating: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
    }, 'No reviews yet'));
  }
  
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgSentiment = reviews.reduce((sum, r) => sum + r.sentimentScore, 0) / reviews.length;
  
  const distribution = reviews.reduce((acc, r) => {
    acc[r.sentimentLabel] = (acc[r.sentimentLabel] || 0) + 1;
    return acc;
  }, {});
  
  return res.status(200).json(new ApiResponse(200, {
    totalReviews: reviews.length,
    averageRating: parseFloat(avgRating.toFixed(1)),
    averageSentiment: parseFloat(avgSentiment.toFixed(2)),
    sentimentDistribution: {
      positive: distribution.positive || 0,
      negative: distribution.negative || 0,
      neutral: distribution.neutral || 0,
    },
  }, 'Sentiment summary retrieved'));
});

export { addCompanyReview, getCompanyReviews, getCompanySentimentSummary, analyzeSentiment };
