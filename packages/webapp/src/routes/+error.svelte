<script>
import { page } from '$app/stores';

// https://kit.svelte.dev/docs/errors
</script>

<svelte:head>
	<title>error page</title>
</svelte:head>

<h1>custom error page</h1>
<p>{$page.status}: {$page.error.message}</p>
