import { NOT_FOUND } from '../common/http-status';
import { Handler } from 'express';
import { logger } from '../common/logger';

export const notFoundHandlerMiddleware: Handler = (req, res) => {
  logger.error(`404 ${req.method} ${req.url}`);
  res.status(NOT_FOUND);
  res.json({
    status: NOT_FOUND,
    error: 'route not found',
  });
};
