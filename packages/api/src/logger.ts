import path from 'node:path';
import { pino } from "pino";
import pinoCaller from 'pino-caller';

const logger = pino({
	level: process.env.API_LOG_LEVEL ?? 'error',
	transport: {
		target: 'pino-pretty',
		options: {
			ignore: 'pid,hostname',
			sync: true,
		}
	},
	// https://github.com/fastify/fastify/blob/v5.2.2/lib/logger-pino.js#L46-L63
	serializers: {
		// check the 5-day course by email for an example
		// req: function (req) {
		// 	return {
		// 		method: req.method,
		// 		url: req.url,
		// 		// version: req.headers && req.headers['accept-version'],
		// 		// host: req.host,
		// 		remoteAddress: req.ip,
		// 		// remotePort: req.socket ? req.socket.remotePort : undefined
		// 	}
		// },
		res: function (reply) {

			return {
				statusCode: reply.statusCode,
				// @ts-ignore
				headers: reply.getHeaders(),
			}
		}
	}
});

export default pinoCaller(logger, { relativeTo: 'file://' + path.resolve(import.meta.dirname)});
// export default logger;
