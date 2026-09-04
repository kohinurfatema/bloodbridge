import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? [],
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [process.env.NODE_ENV !== 'production' ? err.message : 'Something went wrong'],
  });
};

export default errorHandler;
