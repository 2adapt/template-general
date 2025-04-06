import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

type PluginOptions = {
  render?: ((routeList: RouteInfo[]) => void) | null;
  sort?: ((routeList: RouteInfo[]) => RouteInfo[]);
}

// Define a type for route information
type RouteInfo = {
  method: string;
  path: string;
};

// Create an array to store routes
const routes: RouteInfo[] = [];

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options) {
  fastify.log.info({ options }, 'plugins/route-logger.ts');

  // Use the 'onRoute' hook to capture routes as they are registered
  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.method === 'HEAD') { return; }
    // Add the route to our array with only method and path
    routes.push({
      method: routeOptions.method as string,
      path: routeOptions.url
    });
  });

  // Use the 'onReady' hook to log the routes array after all routes are registered
  fastify.addHook('onReady', () => {
    if (options.render === null) {
      return;
    }

    // Apply sort function if provided
    if (options.sort) {
      routes = options.sort(routes);
    }

    if (options.render === undefined) {
      options.render = function(routeList) {
        console.table(routeList);
      }
    }

    options.render(routes);

  });

  // Expose the routes array through the fastify instance
  fastify.decorate('routes', routes);
};

// Add TypeScript declaration for the 'routes' property
declare module 'fastify' {
  interface FastifyInstance {
    routes: RouteInfo[];
  }
}

export default fp(plugin, {
  name: 'route-logger',
  fastify: '5.x',
});
