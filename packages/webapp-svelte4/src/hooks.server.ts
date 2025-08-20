// import { dev } from '$app/environment';
import type { Handle, ServerInit, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// event is similar to the object received in the load function in +page.server.ts
	// the missing properties seem to be these 4: parent, untrack, depends, platform

	const {
		params,
		url,
		route,
		locals,
	} = event;

	console.log('[hooks.server.js:handle]', {
		params,
		url,
		route,
		locals,
	});

	event.locals.nowFromServerHook = Date.now();

	const response = await resolve(event, {
		// https://svelte.dev/docs/kit/accessibility#The-lang-attribute
		transformPageChunk: function({ html }) {
			return html.replace('%lang%', 'pt')
		}
	});

	// response.headers.set('x-custom-header', 'abc');
	return response;
};

export const init: ServerInit = async () => {
	console.log('[hooks.server.js:init]');

	// manually add a listener to the sveltekit shutdown event, to close existing postgres connections;
	// if we don't do this the server will not respond Ctrl+c, SIGINT, etc
	// reference: https://kit.svelte.dev/docs/adapter-node#graceful-shutdown

	process.on('sveltekit:shutdown', async function (reason) {

		console.log('[hooks.server.js:shutdown]', { reason });
		try {
			// ...
		}
		catch (err) {
			console.log('[hooks.server.js:shutdown]', { reason });
		}
	});
};



// "If an unexpected error is thrown during loading or rendering, this function will be called"
// https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror

export const handleError: HandleServerError = async ({ error, status, message, event }) => {

	console.log('[hooks.server.js:handleError]', {
		error,
		// event,
		status,
		message,
	});

	return {
		message: message,
		status: status,
		messageOriginal: error.toString(),
	};
};
