import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import util from 'util';
import stoppable from 'stoppable';
import { logger } from './common/logger';
import { connect } from './db';
import { domainMiddleware } from './middlewares/domainMiddleware';
import { errorHandlerMiddleware } from './middlewares/errorHandlerMiddleware';
import { notFoundHandlerMiddleware } from './middlewares/notFoundHandlerMiddleware';
import loadRoutes from './common/loadRoutes';
import { config } from 'config';
import { ampq } from './lib';
import { reportError } from './common/bugsnag';
import { startSockets } from './socket';
import { addShownDownAction, setupGracefulShutdown } from './shutdown';
import { getDuration } from './common/helper';

const app = express();
const server = stoppable(http.createServer(app), getDuration(30, 's'));
startSockets(server);

Promise.all([connect(), ampq.connect(['publish', 'socket'])])
  .then(async () => {
    app.use(domainMiddleware);
    app.use(compression());
    app.use(
      cors({
        // origin: config.appBaseUrl,
        // credentials: true,
      })
    );
    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: false,
      })
    );
    const uniqId = Math.floor(Math.random() * 1000);
    const ping = `Practice.dev API 💪 (${uniqId})`;
    app.get('/', (req, res) => {
      res.send(ping);
      res.end();
    });
    app.get('/rpc/ping', (req, res) => {
      res.send(ping);
      res.end();
    });
    const apiRouter = express.Router();
    loadRoutes(apiRouter);
    app.use('/rpc', apiRouter);
    app.use(errorHandlerMiddleware);
    app.use(notFoundHandlerMiddleware);
    server.listen(config.api.port, '0.0.0.0', () => {
      logger.info(
        `Express HTTP server listening on port ${config.api.port} in ${process.env.NODE_ENV} mode`
      );
    });

    stoppable(server, getDuration(30, 's'));
    const asyncServerStop = util.promisify(server.stop).bind(server);

    addShownDownAction(100, async () => {
      logger.info('[Server] shuting down');
      await asyncServerStop();
      logger.info('[Server] shutdown success');
    });
  })
  .catch(e => {
    reportError({
      error: e,
      source: 'api',
      data: {
        info: 'Error when starting an api',
      },
    });
    process.exit(1);
  });

setupGracefulShutdown();
