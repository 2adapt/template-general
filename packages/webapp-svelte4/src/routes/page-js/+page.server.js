import { getUsage } from '$lib/utils2.server.js';
import { getDate } from '$lib/utils2.js';

export const load = async function ({
	params,
	url,
	route,
	locals,
	// request,
	// fetch,
	// cookies,
	// setHeaders,
	// getClientAddress,
	// parent,
	// untrack,
	// depends,
	// platform,
	// isDataRequest,
	// isSubRequest,
	// isRemoteRequest,
}) {
	console.log('[routes/page-js/+page.server.js:load]', {
		params,
		url,
		route,
		locals,
		// request,
		// fetch,
		// cookies,
		// setHeaders,
		// getClientAddress,
		// parent,
		// untrack,
		// depends,
		// platform,
		// isDataRequest,
		// isSubRequest,
		// isRemoteRequest,
	});

	const usage = getUsage();
	const title = 'the page title';
	const someDate = getDate();

	return {
		usage,
		title,
		someDate,
	};
};
