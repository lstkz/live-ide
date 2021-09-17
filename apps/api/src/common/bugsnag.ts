import { config } from 'config';
import { Request } from 'express';
import Bugsnag from '@bugsnag/js';
import { Event } from '@bugsnag/core';
import { ContractError } from 'contract';
import { logger } from './logger';

const bugsnagClient =
  config.bugsnag.apiKey === -1
    ? null
    : Bugsnag.start({
        apiKey: config.bugsnag.apiKey,
        plugins: [],
      });

function getRequestInfo(req: Request) {
  if (!req) {
    return {};
  }
  const connection = req.connection;
  const url = req.url;
  const request: any = {
    url: url,
    path: req.path || req.url,
    httpMethod: req.method,
    headers: req.headers,
    httpVersion: req.httpVersion,
  };
  request.params = req.params;
  request.query = req.query;
  request.body = req.body;
  request.clientIp =
    req.ip || (connection ? connection.remoteAddress : undefined);
  request.referer = req.headers.referer || req.headers.referrer;

  if (connection) {
    request.connection = {
      remoteAddress: connection.remoteAddress,
      remotePort: connection.remotePort,
      bytesRead: connection.bytesRead,
      bytesWritten: connection.bytesWritten,
    };
  }

  return request;
}

interface ReportInfoOptions {
  source: 'api' | 'worker';
  message: string;
  data?: any;
}

function _notify(bugsnagEvent: Event) {
  bugsnagClient!._notify(
    bugsnagEvent,
    () => {},
    err => {
      if (err) {
        logger.error('Failed to send event to Bugsnag');
      }
    }
  );
}

export function reportInfo(options: ReportInfoOptions) {
  const { source, message, data } = options;
  logger.info(`[${source}] ${message}`, { data });
  if (!bugsnagClient) {
    return;
  }
  const bugsnagEvent = Bugsnag.Event.create(
    message,
    true,
    {
      severity: 'info',
      unhandled: true,
      severityReason: {
        type: 'infoMessage',
      },
    },
    source,
    0
  );
  if (data) {
    bugsnagEvent.addMetadata('data', data);
  }
  _notify(bugsnagEvent);
}

interface ReportErrorOptions {
  source: 'api' | 'worker' | 'schedular';
  error: Error;
  request?: Request;
  data?: any;
  isHandled?: boolean;
}

export function reportError(options: ReportErrorOptions) {
  const { source, error, request, data, isHandled } = options;
  logger.info(`[${source}]`, error, {
    request: getRequestInfo(request as any),
    data,
  });
  if (!bugsnagClient) {
    return;
  }
  const bugsnagEvent = Bugsnag.Event.create(
    error instanceof ContractError ? error.original : error,
    false,
    {
      severity: 'error',
      unhandled: true,
      severityReason: {
        type: isHandled ? 'handledError' : 'unhandledError',
      },
    },
    source,
    0
  );
  if (request) {
    bugsnagEvent.addMetadata('request', getRequestInfo(request as any));
  }
  if (error instanceof ContractError) {
    bugsnagEvent.addMetadata('entries', error.entries);
  }
  if (data) {
    bugsnagEvent.addMetadata('data', data);
  }
  _notify(bugsnagEvent);
}
