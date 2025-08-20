import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type HttpMethod = "GET" | "POST";
type ApiEndpointConfig = {
	handler: RequestHandler;
	[key: string]: any;
};

type ApiEndpointConfigMap = {
	[K in HttpMethod]?: ApiEndpointConfig;
};


const config: ApiEndpointConfigMap = {};

config.GET = {
	schema: { foo: 123 },
	handler: async function({ url}) {
		console.log('GET handler', this);
		const random = Math.random();

		return json({ random });
	}
}

const GET = config.GET.handler.bind(config.GET);

export { GET }


// test POST with "curl --request POST http://localhost:5000/api"

const POST: RequestHandler = async function ({ url }) {

	console.log('POST handler', this);
	const random2 = Math.random();

	return json({ random2 });
};

export { POST }
