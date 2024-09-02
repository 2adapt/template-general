import postgres from 'postgres';

let { PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME } = process.env;

console.log({ PGPORT, PGDATABASE, PGUSER, PGPASSWORD, PGAPPNAME });

// https://github.com/porsager/postgres?tab=readme-ov-file#connection-details

const sql = postgres({
	port: PGPORT,
	database: PGDATABASE,
	username: PGUSER,
	password: PGPASSWORD,
	connection: {
		application_name: PGAPPNAME + '-webapp',
	},
});

export default sql;
