import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CONFIG, ROLES, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: CONFIG.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: CONFIG.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

const register = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    throw new ApiError(400, 'Email, password, and name are required.');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, CONFIG.BCRYPT_SALT_ROUNDS);
  const validRoles = [ROLES.STUDENT, ROLES.RECRUITER, ROLES.PLACEMENT_CELL];
  const userRole = validRoles.includes(role) ? role : ROLES.STUDENT;

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: userRole,
      ...(userRole === ROLES.STUDENT && {
        student: { create: {} },
      }),
      ...(userRole === ROLES.PARENT_ADVISOR && {
        parentAdvisor: { create: {} },
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const tokens = generateTokens(user.id);

  return res.status(201).json(
    new ApiResponse(201, { user, ...tokens }, SUCCESS_MESSAGES.USER_REGISTERED)
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const tokens = generateTokens(user.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        ...tokens,
      },
      'Login successful.'
    )
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      student: true,
      company: true,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, user, 'Current user profile fetched successfully.')
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new ApiError(400, 'Refresh token is required.');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    const tokens = generateTokens(decoded.userId);

    return res.status(200).json(
      new ApiResponse(200, tokens, 'Tokens refreshed successfully.')
    );
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }
});

export { register, login, getMe, refreshToken };
