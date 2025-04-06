/*
import { type FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifySensible, { type FastifySensibleOptions } from '@fastify/sensible'

type PluginOptions = {}

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options){
  fastify.log.info({ options }, 'plugins/sensible.ts');

  let optionsSensible: FastifySensibleOptions = {}

  fastify.register(fastifySensible, optionsSensible)
}

export default fp(plugin, {
  name: 'sensible',
  fastify: '5.x',
});
*/