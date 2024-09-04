import postgres from 'postgres';

let { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME } = process.env;

console.log({ PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME });

// https://github.com/porsager/postgres?tab=readme-ov-file#connection-details

const sql = postgres({
	host: PGHOST,
	port: PGPORT,
	database: PGDATABASE,
	username: PGUSER,
	password: PGPASSWORD,
	connection: {
		application_name: PGAPPNAME + '-webapp',
	},
});

// manually add a listener to the sveltekit shutdown event, to close existing sql connections;
// if we don't do this the server will not respond Ctrl+c, SIGINT, etc
// reference: https://kit.svelte.dev/docs/adapter-node#graceful-shutdown

process.on('sveltekit:shutdown', async function (reason) {
	// console.log('sveltekit:shutdown', { reason });
	await sql.end();
});

export default sql;
