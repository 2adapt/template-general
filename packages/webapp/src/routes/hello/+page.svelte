<script>
import Component from './Component.svelte';

export let data;
</script>

<div class="border border-orange-500">
	<h1>the hello page</h1>
	<p>now (from the page component) : {data.now}</p>

	<Component></Component>

	<a href="/">navigate to the home page -></a>
</div>
