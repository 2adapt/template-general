import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify'

type PluginOptions = {}

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options){
  fastify.log.info({ options }, 'routes/route-a.ts');

  fastify.route({
    method: 'get',
    url: '/route-a',
    // config: {},
    // schema: {},
    handler: async function  (request, reply) {
      let isEven = Date.now() % 2 === 0;
      let date = fastify.getDate(isEven ? 'iso': '');
      fastify.log.info('bbbb1')
      fastify.log.info({})
      request.log.info('hello world2')
      reply.header('x-foo', 'foo')
      return { now: Date.now(), date }
    }
  });
}

export default fp(plugin, {
  name: 'route-a',
  fastify: '5.x',
  encapsulate: true,
  decorators: {
    fastify: ['getDate'],
    reply: [],
    request: [],
  },
  dependencies: [],
});
