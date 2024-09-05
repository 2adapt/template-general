// https://github.com/brianc/node-postgres
import pg from 'pg';

let { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME } = process.env;

// https://node-postgres.com/apis/pool#new-pool

const pool = new pg.Pool({
	host: PGHOST,
	port: PGPORT,
	database: PGDATABASE,
	user: PGUSER,
	password: PGPASSWORD,
	application_name: PGAPPNAME + '-webapp-pg',
});

pool.on('error', (err) => {
	// avoid killing the node server because of unhandled 'error' event
	console.error('[$lib/pg.server.js]', err.toString());
});

// manually add a listener to the sveltekit shutdown event, to close existing postgres connections;
// if we don't do this the server might not respond Ctrl+c, SIGINT, etc;
// reference: https://kit.svelte.dev/docs/adapter-node#graceful-shutdown

process.on('sveltekit:shutdown', async function (reason) {
	console.log('[$lib/pg.server.js:shutdown]', { reason });

	try {
		await pool.end();
	} catch (err) {
		console.error('[$lib/pg.server.js:shutdown]', err.toString());
	}
});

export { pool as db };
