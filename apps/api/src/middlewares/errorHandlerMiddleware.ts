import { ValidationError } from 'schema';
import { INTERNAL_SERVER_ERROR, BAD_REQUEST } from '../common/http-status';
import { ErrorRequestHandler, Request } from 'express';
import { HttpError, AppError } from '../common/errors';
import { logger } from '../common/logger';
import { reportError } from '../common/bugsnag';

function _getTargetError(e: any) {
  return e.original instanceof Error ? e.original : e;
}

function _isPublicError(e: any) {
  const target = _getTargetError(e);
  return (
    target instanceof AppError ||
    target instanceof ValidationError ||
    target instanceof HttpError ||
    target.expose === true
  );
}

function _getPublicErrorMessage(e: any) {
  const target = _getTargetError(e);
  return target.message;
}

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error,
  req_,
  res,
  next
) => {
  const req = req_ as any as Request;
  const status = _isPublicError(err)
    ? _getTargetError(err).statusCode || BAD_REQUEST
    : INTERNAL_SERVER_ERROR;
  logger.error(err, `${status} ${req.method} ${req.url}`);
  res.status(status);
  if (_isPublicError(err)) {
    res.json({
      error: _getPublicErrorMessage(err),
      stack:
        process.env.NODE_ENV !== 'production'
          ? err.stack!.split('\n')
          : undefined,
    });
  } else {
    reportError({
      error: err,
      source: 'api',
      request: req,
      data: {
        user: req.user,
      },
    });
    res.json({
      error: 'Internal server error',
    });
  }
};
