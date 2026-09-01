import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';
const INDEED_API_URL = 'https://api.indeed.com/ads/apisearch';

const searchExternalJobs = asyncHandler(async (req, res) => {
  const { source, keyword, location, type, region, page = 1, limit = 20 } = req.query;

  const where = { isActive: true };
  if (source) where.source = source;
  if (type) where.type = type;
  if (region) where.region = region;
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { company: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }
  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    prisma.externalJob.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { postedAt: 'desc' },
    }),
    prisma.externalJob.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, 'External jobs retrieved.')
  );
});

const importFromLinkedIn = asyncHandler(async (req, res) => {
  const { keywords, location, count = 10 } = req.body;

  if (!keywords) {
    throw new ApiError(400, 'Keywords are required');
  }

  const mockJobs = [];
  const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb'];
  const titles = ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer', 'Data Scientist'];

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const salaryMin = Math.floor(Math.random() * 20) + 10;
    const salaryMax = salaryMin + Math.floor(Math.random() * 15) + 5;

    mockJobs.push({
      source: 'LINKEDIN',
      externalId: `li-${Date.now()}-${i}`,
      title: `${title} - ${keywords}`,
      company,
      description: `Exciting opportunity at ${company} for a ${title}. Join our team and work on cutting-edge technology.`,
      requirements: ['Bachelor\'s degree', '2+ years experience', 'Strong problem-solving skills'],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'].slice(0, Math.floor(Math.random() * 3) + 2),
      salary: `$${salaryMax}K - $${salaryMax + 20}K`,
      salaryMin: salaryMax,
      salaryMax: salaryMax + 20,
      salaryCurrency: 'USD',
      location: location || 'San Francisco, CA',
      region: 'US',
      type: 'FULL_TIME',
      applicationUrl: `https://www.linkedin.com/jobs/view/mock-${Date.now()}-${i}`,
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyLogo: `https://logo.clearbit.com/${company.toLowerCase()}.com`,
      companyWebsite: `https://careers.${company.toLowerCase()}.com`,
    });
  }

  const imported = await prisma.externalJob.createMany({
    data: mockJobs,
    skipDuplicates: true,
  });

  return res.status(201).json(
    new ApiResponse(201, { imported: imported.count }, `Imported ${imported.count} jobs from LinkedIn.`)
  );
});

const importFromIndeed = asyncHandler(async (req, res) => {
  const { query, location, count = 10 } = req.body;

  if (!query) {
    throw new ApiError(400, 'Query is required');
  }

  const mockJobs = [];
  const companies = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Accenture', 'IBM'];
  const titles = ['Software Developer', 'System Engineer', 'Programmer Analyst', 'Technical Consultant'];

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const salaryMin = Math.floor(Math.random() * 15) + 3;
    const salaryMax = salaryMin + Math.floor(Math.random() * 10) + 2;

    mockJobs.push({
      source: 'INDEED',
      externalId: `ind-${Date.now()}-${i}`,
      title: `${title}`,
      company,
      description: `${company} is hiring ${title} for their ${query} team. Great opportunity for freshers and experienced professionals.`,
      requirements: ['B.Tech/M.Tech', 'Good communication skills', 'Team player'],
      skills: ['Java', 'Python', 'SQL', 'Communication'].slice(0, Math.floor(Math.random() * 3) + 2),
      salary: `${salaryMin} LPA - ${salaryMax} LPA`,
      salaryMin,
      salaryMax,
      salaryCurrency: 'INR',
      location: location || 'Bangalore, India',
      region: 'INDIA',
      type: 'FULL_TIME',
      applicationUrl: `https://www.indeed.com/viewjob?jk=mock-${Date.now()}-${i}`,
      postedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyLogo: `https://logo.clearbit.com/${company.toLowerCase()}.com`,
      companyWebsite: `https://www.${company.toLowerCase()}.com/careers`,
    });
  }

  const imported = await prisma.externalJob.createMany({
    data: mockJobs,
    skipDuplicates: true,
  });

  return res.status(201).json(
    new ApiResponse(201, { imported: imported.count }, `Imported ${imported.count} jobs from Indeed.`)
  );
});

const getExternalJobById = asyncHandler(async (req, res) => {
  const job = await prisma.externalJob.findUnique({
    where: { id: req.params.id },
  });

  if (!job) {
    throw new ApiError(404, 'Job not found.');
  }

  return res.status(200).json(new ApiResponse(200, job, 'Job details retrieved.'));
});

const syncExternalJobs = asyncHandler(async (req, res) => {
  const { sources = ['LINKEDIN', 'INDEED'] } = req.body;

  const results = {};

  if (sources.includes('LINKEDIN')) {
    const linkedinJobs = await prisma.externalJob.count({ where: { source: 'LINKEDIN' } });
    results.linkedin = { existing: linkedinJobs, status: 'synced' };
  }

  if (sources.includes('INDEED')) {
    const indeedJobs = await prisma.externalJob.count({ where: { source: 'INDEED' } });
    results.indeed = { existing: indeedJobs, status: 'synced' };
  }

  const totalJobs = await prisma.externalJob.count({ where: { isActive: true } });

  return res.status(200).json(
    new ApiResponse(200, { results, totalActive: totalJobs }, 'Sync completed.')
  );
});

export {
  searchExternalJobs,
  importFromLinkedIn,
  importFromIndeed,
  getExternalJobById,
  syncExternalJobs,
};
