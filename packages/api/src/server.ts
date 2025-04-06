// Read the .env file.
// import * as dotenv from "dotenv";
// dotenv.config();

import Fastify from "fastify";
import closeWithGrace from "close-with-grace";
import { nanoid } from "nanoid";
// import pino from 'pino';
// const pino = require('pino')()
// const pinoCaller = require('pino-caller')(pino, { relativeTo: __dirname, stackAdjustment: 1 })
import logger from './logger.ts';

const fastify = Fastify({
  loggerInstance: logger,
  /*
  logger: {
    level: process.env.API_LOG_LEVEL ?? 'error',
    transport: {
      target: './logger.ts',
      options: {
        colorize: true
      }
    },
    // timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    // https://github.com/fastify/fastify/blob/v5.2.2/lib/logger-pino.js#L46-L63
    serializers: {
      req: function (req) {
        return {
          method: req.method,
          url: req.url,
          // version: req.headers && req.headers['accept-version'],
          // host: req.host,
          remoteAddress: req.ip,
          // remotePort: req.socket ? req.socket.remotePort : undefined
        }
      },
      res: function (reply) {

        return {
          statusCode: reply.statusCode,
          // @ts-ignore
          // headers: reply.getHeaders(),
        }
      }
    }
  },
  */
  genReqId: () => nanoid()
});

// delay is in milliseconds
closeWithGrace({ delay: parseInt(process.env.FASTIFY_CLOSE_GRACE_DELAY || '1000') }, async function ({ signal, err, manual }) {
  if (err instanceof Error) {
    fastify.log.error({ err }, 'server closing with error')
  }

  if (signal !== undefined) {
    fastify.log.info({ signal }, 'server closing with signal')
  }

  await fastify.close()
} as closeWithGrace.CloseWithGraceAsyncCallback)

try {
  await fastify.register(import("./root.ts"));
  // await fastify.ready()
  await fastify.listen({ port: parseInt(process.env.API_PORT || '3000'), host: '0.0.0.0'})
} catch (err) {
  fastify.log.error({ err })
  process.exit(1)
}
