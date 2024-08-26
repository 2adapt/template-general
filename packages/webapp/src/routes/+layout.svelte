<script>
import { page, navigating } from '$app/stores';
import { assets, base } from '$app/paths';
import { dev } from '$app/environment';
import '../app.css';

let navigationLog = [];

$: {
	if ($navigating != null) {
		navigationLog = [...navigationLog, { storeValue: $navigating, ts: Date.now() }];
	}
}
</script>

<svelte:head>
	<title>{$page.data.title}</title>
</svelte:head>

<slot />

<hr />

<div class="border-2 border-green-300"
	>navigation log
	<ul>
		{#each navigationLog as item}
			<li>{JSON.stringify(item.storeValue)}</li>
		{/each}
	</ul>
</div>

<footer class="border my-4">the footer</footer>

<!--https://kit.svelte.dev/docs/modules-->

<textarea class="w-72 h-72">$page ($app/stores): {JSON.stringify($page, null, 4)}</textarea>
<textarea class="w-72 h-72">$navigating ($app/stores): {JSON.stringify($navigating, null, 4)}</textarea>
<textarea class="w-72 h-72">$app/paths: {JSON.stringify({ assets, base }, null, 4)}</textarea>

{#if dev}
	<span
		class="debug-screens"
		something="123"
	></span>
{/if}
