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
	console.error(err.toString());
});

process.on('sveltekit:shutdown', async function (reason) {
	console.log('sveltekit:shutdown $lib/server/pg.js', { reason });

	try {
		await pool.end();
	} catch (err) {
		console.error(err.toString());
	}
});

export { pool as db };
