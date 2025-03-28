<script>
import { page, navigating } from '$app/stores';
// import { assets, base } from '$app/paths';
import { dev } from '$app/environment';
import Inspect from '$lib/Inspect.svelte';
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

<footer class="border-4 border-orange-400 my-4">
	<p>the footer (/routes/+layout.svelte)</p>
	<!--https://kit.svelte.dev/docs/modules-->

	<div class="flex p-2 space-x-4">
		<Inspect
			title="the page store"
			value="{$page}"
		></Inspect>
		<Inspect
			title="the navigating store"
			value="{$navigating}"
		></Inspect>
		<Inspect
			title="the navigation log"
			value="{navigationLog}"
		></Inspect>
	</div>
</footer>





{#if dev}
	<span
		class="debug-screens"
		something="123"
	></span>
{/if}
