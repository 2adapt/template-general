import { test } from 'node:test'
import * as assert from 'node:assert'
import Fastify from 'fastify'
import Support from '../../src/routes/route-a.js'

test('support works standalone', async (t) => {
  const fastify = Fastify()
  void fastify.register(Support)
  await fastify.ready()

  assert.equal(fastify.someSupport(), 'hugs')
})
