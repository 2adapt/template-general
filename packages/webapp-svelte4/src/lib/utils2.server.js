// https://kit.svelte.dev/docs/server-only-modules

function getUsage() {

	const memory = process.memoryUsage();
	const cpu = process.cpuUsage();
	const resource = process.resourceUsage();
	const version = process.version;

	return {
		memory,
		cpu,
		resource,
		version,
	}
}

export { getUsage };
