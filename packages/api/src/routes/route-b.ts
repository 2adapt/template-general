import fp from 'fastify-plugin';
import { type FastifyPluginAsync } from 'fastify'
// import Boom from '@hapi/boom';

type PluginOptions = {}

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options){
  fastify.log.info({ options }, 'routes/route-b.ts');

  fastify.route({
    method: 'get',
    url: '/route-b',
    // config: {},
    // schema: {},
    handler: async function (request, reply) {
      let isEven = Date.now() % 2 === 0;


      if (isEven) {
        throw reply.badRequest('yyyy');
      }

      let decoratedValue = fastify.getDate('iso');

      return { success: true, now: Date.now(), decoratedValue  }
    }
  });

}

export default fp(plugin, {
  name: 'route-b',
  fastify: '5.x',
  encapsulate: true,
  decorators: {
    fastify: ['getDate'],
    reply: ['badRequest'],
    request: [],
  },
  dependencies: [],
});
