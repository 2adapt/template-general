import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async function ({
	params,
	route,
}) {
	console.log('[routes/test/[theParam]/+page.server.ts:load]', {
		params,
		route,
	});

	return {
		param: params.theParam,
		routeId: route.id,
	};
};
