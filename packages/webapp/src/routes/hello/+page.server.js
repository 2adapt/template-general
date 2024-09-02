import { error } from '@sveltejs/kit';
import { getISODate } from '$lib/utils.server.js';
import { getNow } from '$lib/utils.js';
import sql from '$lib/sql.server.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, url, route }) {
	// ...

	console.log({
		params,
		url,
		route,
	});

	let result = await sql`

		SELECT current_database()

	`;

	let result2 = await sql`

		SELECT * 
		FROM pg_stat_activity
		WHERE datname = ${result[0]['current_database']}
	
	`;

	// console.log({ result2 })

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
		pg_stat_activity: result2,
		title: 'the hello page',
	};

	return data;
}
