<script>
import { page } from '$app/stores';

// https://kit.svelte.dev/docs/errors
</script>

<svelte:head>
	<title>{$page.data.title}</title>
</svelte:head>

<h1>My custom error page2</h1>
<p>{$page.status}: {$page.error.message}</p>

<textarea>{JSON.stringify($page, null, 2)}</textarea>
