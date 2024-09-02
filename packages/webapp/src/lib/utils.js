// https://kit.svelte.dev/docs/modules#$lib

function getNow() {
	let now = Date.now();

	console.log('[utils.js:8] ');

	console.log('[utils.js:9] ');

	return now;
}

export { getNow };
