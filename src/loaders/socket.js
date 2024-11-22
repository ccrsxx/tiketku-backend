import { Server } from 'socket.io';
import { logger } from './pino.js';
import { corsOptions } from './cors.js';

/** @import {Server as HttpServer} from 'http' */
/** @import {Application} from 'express' */

/** @type {Server} */
export let io;

/**
 * @param {Application} _app
 * @param {HttpServer} server
 */
export default (_app, server) => {
  io = new Server(server, {
    cors: corsOptions
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected');

    socket.on(
      'disconnect',
      /** @param {string} reason */
      (reason) => {
        logger.info(`Socket disconnected: ${reason}`);
      }
    );
  });
};
