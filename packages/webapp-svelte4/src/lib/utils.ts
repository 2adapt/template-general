// https://kit.svelte.dev/docs/modules#$lib

function getDate() {
	if (Date.now() % 2 === 0) {
		return Date.now();
	}
	else {
		return new Date().toISOString();
	}
}

export {
	getDate,
};
