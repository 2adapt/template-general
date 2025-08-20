import type { PageServerLoad } from './$types';
import { getUsage } from '$lib/utils.server.ts';
import { getDate } from '$lib/utils.ts';

export const load: PageServerLoad = async function ({
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
	console.log('[routes/page-ts/+page.server.ts:load]', {
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
		x5: 123
	};
};
