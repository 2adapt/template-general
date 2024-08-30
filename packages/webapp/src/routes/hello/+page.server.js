import { error } from '@sveltejs/kit';
import { getISODate } from '$lib/utils.server.js';
import { getNow } from '$lib/utils.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, url, route }) {
	// ...

	console.log({
		params,
		url,
		route,
	});

	let now = getNow();

	if (now % 2 === 0) {
		error(418, {
			message: 'this route does not work for even timestamps; try again;',
		});
	}

	let isoDate = getISODate();

	let data = {
		now,
		// isoDate,
		title: 'the hello page',
	};

	return data;
}
