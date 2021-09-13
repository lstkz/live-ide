import { create } from 'domain';
import { Handler } from 'express';

export const domainMiddleware: Handler = (req, res, next) => {
  const domain = create();
  domain.add(req);
  domain.add(res);
  domain.run(next);
  domain.on('error', next);
};
