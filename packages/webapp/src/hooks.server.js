// import { dev } from '$app/environment';

export async function handle({ event, resolve }) {
	// event is similar to the object received in the load function in +page.server.js
	// the missing properties seem to be these 4: parent, untrack, depends, platform

	let {
		params,
		url,
		route,
		fetch,
		cookies,
		locals,
		// setHeaders,
		// getClientAddress,
		// request,
		// isDataRequest,
		// isSubRequest,
	} = event;

	console.log('[hooks.server.js:handle]', {
		params,
		url,
		route,
		fetch,
		cookies,
		locals,
		// setHeaders,
		// getClientAddress,
		// request,
		// isDataRequest,
		// isSubRequest,
	});

	event.locals.nowFromServerHook = Date.now();

	const response = await resolve(event);
	return response;
}

// "If an unexpected error is thrown during loading or rendering, this function will be called"
// https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror

export async function handleError({ error, status, message, event }) {
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
}
