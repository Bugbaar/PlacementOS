import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority, targetGroup } = req.body;

  if (!title || !content) {
    throw new ApiError(400, 'Title and content are required.');
  }

  const announcement = await prisma.announcement.create({
    data: {
      authorId: req.user.id,
      title,
      content,
      priority: priority || 'MEDIUM',
      targetGroup: targetGroup || 'ALL',
    },
    include: { author: { select: { id: true, name: true, role: true, avatar: true } } },
  });

  return res.status(201).json(new ApiResponse(201, announcement, 'Announcement published.'));
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, priority, targetGroup } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};
  if (priority) where.priority = priority;
  if (targetGroup) where.targetGroup = { in: ['ALL', targetGroup] };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      include: { author: { select: { id: true, name: true, role: true, avatar: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count({ where }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        announcements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Announcements retrieved.'
    )
  );
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  return res.status(200).json(new ApiResponse(200, null, 'Announcement removed.'));
});

export { createAnnouncement, listAnnouncements, deleteAnnouncement };
