<script>
import { page } from '$app/stores';
import { dev } from '$app/environment';

// https://kit.svelte.dev/docs/errors
</script>

<svelte:head>
	<title>error page</title>
</svelte:head>

<h1>custom error page</h1>
<p>{$page.error.status || $page.status}: {$page.error.message}</p>
{#if (dev || true) && $page.error.messageOriginal}
	<p>{$page.error.messageOriginal}</p>
{/if}
