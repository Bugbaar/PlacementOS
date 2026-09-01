import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createCompany = asyncHandler(async (req, res) => {
  const { name, logo, website, industry, description, location, size, foundedYear } = req.body;

  if (!name) {
    throw new ApiError(400, 'Company name is required.');
  }

  try {
    const company = await prisma.company.create({
      data: {
        name,
        logo,
        website,
        industry,
        description,
        location,
        size,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        createdBy: req.user.id,
      },
    });

    return res.status(201).json(new ApiResponse(201, company, 'Company created successfully.'));
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ApiError(409, 'You have already created a company profile.');
    }
    throw error;
  }
});

const listCompanies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, industry } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { industry: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (industry) where.industry = { contains: industry, mode: 'insensitive' };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { _count: { select: { jobs: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.company.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        companies,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Companies retrieved.'
    )
  );
});

const getCompanyById = asyncHandler(async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
    include: {
      jobs: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } },
      drives: { orderBy: { date: 'desc' }, take: 5 },
      _count: { select: { jobs: true, drives: true } },
    },
  });

  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }

  return res.status(200).json(new ApiResponse(200, company, 'Company details retrieved.'));
});

const ALLOWED_COMPANY_FIELDS = [
  'name', 'logo', 'website', 'industry',
  'description', 'location', 'size', 'foundedYear'
];

const updateCompany = asyncHandler(async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
  });

  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }

  if (company.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Not authorized to update this company.');
  }

  const data = {};
  for (const key of ALLOWED_COMPANY_FIELDS) {
    if (req.body[key] !== undefined) {
      if (key === 'foundedYear' && req.body.foundedYear) {
        data[key] = parseInt(req.body.foundedYear);
      } else {
        data[key] = req.body[key];
      }
    }
  }

  const updated = await prisma.company.update({
    where: { id: req.params.id },
    data,
  });

  return res.status(200).json(new ApiResponse(200, updated, 'Company updated.'));
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { id: req.params.id },
  });

  if (!company) {
    throw new ApiError(404, 'Company not found.');
  }

  if (company.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Not authorized to delete this company.');
  }

  await prisma.company.delete({ where: { id: req.params.id } });

  return res.status(200).json(new ApiResponse(200, null, 'Company deleted.'));
});

const getMyCompany = asyncHandler(async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { createdBy: req.user.id },
    include: {
      jobs: { orderBy: { createdAt: 'desc' } },
      _count: { select: { jobs: true, drives: true } },
    },
  });

  return res.status(200).json(new ApiResponse(200, company, 'Recruiter company fetched.'));
});

export { createCompany, listCompanies, getCompanyById, updateCompany, deleteCompany, getMyCompany };
