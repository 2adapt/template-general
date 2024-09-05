<script>
import { onMount, onDestroy } from 'svelte';
import { page } from '$app/stores';
import Inspect from '$lib/Inspect.svelte';
import { getNow } from '$lib/utils.js';

let now = getNow();

onMount(function () {
	console.log('[/hello/Component.svelte:onMount]');
});

onDestroy(function () {
	console.log('[/hello/Component.svelte:onDestroy]');
});
</script>

<div class="border-4 border-blue-500">
	<div class="something-green">now from the component: {now}</div>
	<div>
		<Inspect
			title="the page store at Component.svelte"
			value="{$page}"
		></Inspect>
	</div>
</div>

<style>
.something-green {
	background: limegreen;
}
</style>
