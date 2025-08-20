import type { ServerInit, HandleClientError } from '@sveltejs/kit';

export const init: ServerInit = async () => {
	console.log('[hooks.client.js:init]');
};


// "If an unexpected error is thrown during loading or rendering, this function will be called"
// https://kit.svelte.dev/docs/hooks#shared-hooks-handleerror

// "not called for expected errors (those thrown with the error function imported from @sveltejs/kit)."
// "Make sure that handleError never throws an error"

export const handleError: HandleClientError = async ({ error, status, message, event }) => {
	console.log('[hooks.client.js:handleError]', {
		error,
		// event,
		status,
		message,
	});

	// "The returned value, which defaults to { message }, becomes the value of $page.error."
	return {
		message: message,
		status: status,
		messageOriginal: error.toString(),
	};
};
