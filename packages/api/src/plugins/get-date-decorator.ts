import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Boom from '@hapi/boom';

type PluginOptions = {}

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options){
  fastify.log.info({ options }, 'plugins/get-date-decorator.ts');

  let getDate = function (format: string) {

    fastify.log.info('aaaa1')
    //return `${options.message} at ${new Date().toISOString()}`;
    return format === 'iso' ? new Date().toISOString() : Date.now()
  };

  fastify.decorate('getDate', getDate);

  fastify.log.info({ options }, 'plugins/get-date-decorator.ts');

  // https://github.com/hapijs/boom/blob/master/lib/index.js

  let boomMethods = [
    // 4xx
    'badRequest',
    'unauthorized',
    // 'paymentRequired',
    'forbidden',
    'notFound',
    'methodNotAllowed',
    // 'notAcceptable',
    // 'proxyAuthRequired',
    // 'clientTimeout',
    // 'conflict',
    // 'resourceGone',
    // 'lengthRequired',
    // 'preconditionFailed',
    // 'entityTooLarge',
    // 'uriTooLong',
    // 'unsupportedMediaType',
    // 'rangeNotSatisfiable',
    // 'expectationFailed',
    // 'teapot',
    // 'badData',
    // 'locked',
    // 'failedDependency',
    // 'tooEarly',
    // 'preconditionRequired',
    // 'tooManyRequests',
    // 'illegal',

    // 5xx
    'internal',
    // 'notImplemented',
    // 'badGateway',
    // 'serverUnavailable',
    // 'gatewayTimeout',
    // 'badImplementation',
  ] as const;

  for (let method of boomMethods) {
    fastify.decorateReply(method, function(message: string, data: any) {

      // type X = { statusCode: number };
      let err: Boom.Boom = Boom[method](message, data);
      err.reformat(true);

      // @ts-ignore
      err.statusCode = err.output.payload.statusCode;

      return err;
    });
  }



}

export default fp(plugin, {
  name: 'get-date-decorator',
  fastify: '5.x',
});

// When using .decorate you have to specify added properties for Typescript

declare module 'fastify' {
  export interface FastifyInstance {
    getDate(format: string): string | number;
  }

  export interface FastifyReply {
    // 4xx
    badRequest(message: string, data?: any): Boom.Boom;
    unauthorized(message: string, data?: any): Boom.Boom;
    // paymentRequired(message: string, data?: any): Boom.Boom;
    forbidden(message: string, data?: any): Boom.Boom;
    notFound(message: string, data?: any): Boom.Boom;
    methodNotAllowed(message: string, data?: any): Boom.Boom;
    // notAcceptable(message: string, data?: any): Boom.Boom;
    // proxyAuthRequired(message: string, data?: any): Boom.Boom;
    // clientTimeout(message: string, data?: any): Boom.Boom;
    // conflict(message: string, data?: any): Boom.Boom;
    // resourceGone(message: string, data?: any): Boom.Boom;
    // lengthRequired(message: string, data?: any): Boom.Boom;
    // preconditionFailed(message: string, data?: any): Boom.Boom;
    // entityTooLarge(message: string, data?: any): Boom.Boom;
    // uriTooLong(message: string, data?: any): Boom.Boom;
    // unsupportedMediaType(message: string, data?: any): Boom.Boom;
    // rangeNotSatisfiable(message: string, data?: any): Boom.Boom;
    // expectationFailed(message: string, data?: any): Boom.Boom;
    // teapot(message: string, data?: any): Boom.Boom;
    // badData(message: string, data?: any): Boom.Boom;
    // locked(message: string, data?: any): Boom.Boom;
    // failedDependency(message: string, data?: any): Boom.Boom;
    // tooEarly(message: string, data?: any): Boom.Boom;
    // preconditionRequired(message: string, data?: any): Boom.Boom;
    // tooManyRequests(message: string, data?: any): Boom.Boom;
    // illegal(message: string, data?: any): Boom.Boom;

    // 5xx
    internal(message: string, data?: any): Boom.Boom;
    // notImplemented(message: string, data?: any): Boom.Boom;
    // badGateway(message: string, data?: any): Boom.Boom;
    // serverUnavailable(message: string, data?: any): Boom.Boom;
    // gatewayTimeout(message: string, data?: any): Boom.Boom;
    // badImplementation(message: string, data?: any): Boom.Boom;
  }
}
