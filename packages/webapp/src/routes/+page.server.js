import { getNow } from '$lib/utils.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({
	params,
	url,
	route,
	fetch,
	cookies,
	setHeaders,
	getClientAddress,
	parent,
	locals,
	untrack,
	depends,
	platform,
	request,
	isDataRequest,
	isSubRequest,
}) {
	// ...

	// input for the load functions: https://kit.svelte.dev/docs/load#universal-vs-server-input

	console.log('[/+page.server.js]', {
		params,
		url,
		route,
		fetch,
		cookies,
		setHeaders,
		getClientAddress,
		parent,
		locals,
		untrack,
		depends,
		platform,
		request,
		isDataRequest,
		isSubRequest,
	});

	// output for the load functions: https://kit.svelte.dev/docs/load#universal-vs-server-output

	let data = {
		now: getNow(),
		title: 'the root page',
	};

	return data;
}
