// https://github.com/porsager/postgres
import postgres from 'postgres';

let { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME } = process.env;

// https://github.com/porsager/postgres?tab=readme-ov-file#connection-details

const sql = postgres({
	host: PGHOST,
	port: PGPORT,
	database: PGDATABASE,
	username: PGUSER,
	password: PGPASSWORD,
	connection: {
		application_name: PGAPPNAME + '-webapp-postgres',
	},
	types: {
		// override how dates are retrieved from the database; we parse them
		// so that the we get a ISO string (without the milisecond part)
		// reference: https://github.com/porsager/postgres/blob/master/src/types.js#L28-L33
		date: {
			to: 1184,
			from: [1082, 1114, 1184],
			serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
			// parse: x => new Date(x), // this is the original
			// parse: (x) => new Date(x).toISOString().replace('.000Z', 'Z'),
			parse: (x) => new Date(x).toISOString().substring(0, 19) + 'Z',
		},
	},
});

// manually add a listener to the sveltekit shutdown event, to close existing postgres connections;
// if we don't do this the server will not respond Ctrl+c, SIGINT, etc
// reference: https://kit.svelte.dev/docs/adapter-node#graceful-shutdown

process.on('sveltekit:shutdown', async function (reason) {
	console.log('[$lib/postgres.server.js:shutdown]', { reason });

	try {
		await sql.end();
	} catch (err) {
		console.error('[$lib/postgres.server.js:shutdown]', err.toString());
	}
});

export { sql };
