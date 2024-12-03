import { error } from '@sveltejs/kit';
import { getISODate } from '$lib/utils.server.js';
import { getNow } from '$lib/utils.js';
import { sql } from '$lib/postgres.server.js';
// import { db } from '$lib/pg.server.js';
let { PGDATABASE } = process.env;

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ params, url, route, locals }) {
	// ...

	let logId = '[/hello/+page.server.js:load]';

	console.log(logId, {
		params,
		url,
		route,
		locals,
	});

	// simulate expected error: https://kit.svelte.dev/docs/errors#expected-errors

	let now = getNow();

	if (now % 2 === 0) {
		// error(418, {
		// 	message: 'this route does not work for even timestamps; try again;',
		// });
	}

	// simulate delay from the database using pg_sleep

	let delay_in_seconds = Number(url.searchParams.get('delay_in_seconds'));

	if (Number.isNaN(delay_in_seconds)) {
		delay_in_seconds = 0;
	}

	console.time(logId + '-query1-' + now);
	let result1 = await sql`SELECT now()`;
	console.timeEnd(logId + '-query1-' + now);

	console.time('query2-' + now);
	let result2 = await sql`

		SELECT application_name, backend_start, query_start, state, query, pg_sleep(${delay_in_seconds})
		FROM pg_stat_activity
		WHERE datname = ${PGDATABASE}

	`;
	console.time(logId + '-query2-' + now);

	console.timeEnd(logId + '-query2-' + now);
	// let result3 = await db.query(
	// 	`
	//
	// 	SELECT application_name, backend_start, query_start, state, query, pg_sleep($1)
	// 	FROM pg_stat_activity
	// 	WHERE datname = $2
	//
	// `,
	// 	[delay_in_seconds, PGDATABASE],
	// );
	// console.time(logId + '-query3-' + now);

	// unused variable

	let isoDate = getISODate();

	let data = {
		now,
		// isoDate,
		'pg_stat_activity (from postgres)': result2,
		//'pg_stat_activity (from pg)': result3.rows,
		title: 'the hello page',
		// result3,
	};

	return data;
}
