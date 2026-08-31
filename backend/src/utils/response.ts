import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res: Response, code: string, message: string, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
