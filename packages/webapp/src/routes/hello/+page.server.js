import { error } from '@sveltejs/kit';
import { getNow } from '$lib/utils.js';
import { getISODate } from '$lib/utils.server.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, url, route }) {
	// ...

	console.log({
		params,
		url,
		route,
	});

	let now = getNow();
	let isoDate = getISODate();

	if (now % 2 === 0) {
		error(418, {
			message: 'this route does now work for even timestamps; try again;',
		});
	}

	let data = {
		now,
		isoDate,
		title: 'the hello page',
	};

	return data;
}
