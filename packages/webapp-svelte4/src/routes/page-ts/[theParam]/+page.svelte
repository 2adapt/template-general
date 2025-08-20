<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	const { param, routeId } = data;

</script>

<textarea cols="30" rows="10">{JSON.stringify({ param, routeId }, null, 2)}</textarea>