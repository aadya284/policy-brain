import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/index.js';

export const errorHandler = (
  error: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error occurred:', error);

  // Handle multer errors
  if (error.name === 'MulterError') {
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 10MB.';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        code = 'INVALID_FILE_FIELD';
        break;
    }

    const apiError: ApiError = {
      message,
      code,
    };

    res.status(400).json(apiError);
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    const apiError: ApiError = {
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.message,
    };

    res.status(400).json(apiError);
    return;
  }

  // Handle custom API errors
  if (error.message && typeof (error as any).code === 'string') {
    const apiError: ApiError = {
      message: error.message,
      code: (error as any).code,
    };

    res.status(400).json(apiError);
    return;
  }

  // Default error response
  const apiError: ApiError = {
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
    code: 'INTERNAL_ERROR',
  };

  res.status(500).json(apiError);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const apiError: ApiError = {
    message: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  };

  res.status(404).json(apiError);
};