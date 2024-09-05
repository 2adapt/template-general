// https://kit.svelte.dev/docs/server-only-modules

function getISODate() {
	let isoDate = new Date().toISOString();

	return isoDate;
}

export { getISODate };
