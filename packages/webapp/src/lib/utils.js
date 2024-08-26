// https://kit.svelte.dev/docs/modules#$lib

function getNow() {
	let now = Date.now();

	return now;
}

export { getNow };
