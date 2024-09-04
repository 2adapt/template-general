<script>
import { goto } from '$app/navigation';

export let data;

let counter = 0;
async function incrementCounter() {
	counter++;

	if (counter >= 3) {
		await goto('hello');
	}
}
</script>

<div class="border border-indigo-500">
	<h1 class="bg-blue-200">Welcome to SvelteKit home page</h1>

	<img
		src="/static-webapp/images/velhotes.jpg"
		title="velhotes - click 3 times to navigate with goto()"
		on:click="{incrementCounter}"
	/>

	<p>now (from the page component) : {data.now}</p>
	<p>counter: {counter}</p>

	<a href="/hello?delay_in_seconds=0">navigate to the hello page -></a>
</div>
