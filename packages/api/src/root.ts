// import * as path from 'node:path';
import {type  FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async function (fastify, options) {
  fastify.log.info({ options }, 'root.ts');

  // await fastify.register(import('./plugins/sensible.ts'));
  await fastify.register(import('./plugins/static.ts'));
  await fastify.register(import('./plugins/get-date-decorator.ts'));

  // Register route logger plugin (before routes to ensure all routes are captured)
  await fastify.register(import('./plugins/route-logger.ts'), {
   // render: function (routeList) { console.log({ routeList })}
  });

  // Register routes
  await fastify.register(import('./routes/route-a.ts'));
  await fastify.register(import('./routes/route-b.ts'));



  // fastify.setErrorHandler(function (err, request, reply) {
  //
  //   console.log('uuu');
  //   uuu;
  //   fastify.log.error(
  //     {
  //       err,
  //       request: {
  //         method: request.method,
  //         url: request.url,
  //         query: request.query,
  //         params: request.params
  //       }
  //     },
  //     'Unhandled error occurred'
  //   )
  //
  //   reply.code(err.statusCode ?? 500)
  //
  //   let message = 'Internal Server Error'
  //   if (err.statusCode && err.statusCode < 500) {
  //     message = err.message
  //   }
  //
  //   return { message }
  // })

  // An attacker could search for valid URLs if your 404 error handling is not rate limited.
  // fastify.setNotFoundHandler(
  //   {
  //     preHandler: fastify.rateLimit({
  //       max: 3,
  //       timeWindow: 500
  //     })
  //   },
  //   (request, reply) => {
  //     request.log.warn(
  //       {
  //         request: {
  //           method: request.method,
  //           url: request.url,
  //           query: request.query,
  //           params: request.params
  //         }
  //       },
  //       'Resource not found'
  //     )
  //
  //     reply.code(404)
  //
  //     return { message: 'Not Found' }
  //   })
};

export default fp(plugin, {
  name: 'root',
  fastify: '5.x',
});
