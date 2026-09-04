import { Response } from 'express';

export const sendSuccess = (res: Response, statusCode: number, message: string, data: unknown = {}) => {
  res.status(statusCode).json({ success: true, message, data });
};
