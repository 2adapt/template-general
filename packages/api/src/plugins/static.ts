import path from 'node:path';
import { type FastifyPluginAsync } from 'fastify';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static'
import fp from 'fastify-plugin';
// import fp from 'fastify-plugin';


type PluginOptions = {}

const plugin: FastifyPluginAsync<PluginOptions> = async function (fastify, options){
	fastify.log.info({ options }, 'plugins/static.ts');

	let optionsStatic: FastifyStaticOptions = {
		root: path.join(import.meta.dirname, '..', '..'),
		list: {
			format: 'html',
			render: function (dirs, files) {
				let fileList = `
				<p>directories</p>
				<ul>
					${dirs.map(dir => `<li><a href="${dir.href}">${dir.name}</a></li>`).join('\n  ')}
				</ul>
				<p>files</p>
				<ul>
					${files.map(file => `<li><a href="${file.href}" target="_blank">${file.name}</a></li>`).join('\n  ')}
				</ul>
				`;

				return fileList;
			},
		}
	};

	await fastify.register(fastifyStatic, optionsStatic)

	fastify.get('/p', function (req, reply) {
		reply.sendFile('package.json') // serving path.join(__dirname, 'public', 'myHtml.html') directly
	})
};

export default fp(plugin, {
	name: 'static',
	fastify: '5.x',
});
