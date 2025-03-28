<script>
import { goto } from '$app/navigation';
export let data;

let counter = 0;
async function incrementCounter() {
	counter++;

	if (counter >= 3) {
		// await goto('db');
	}
}
</script>

<div class="border-4 border-indigo-500">
	<h1 class="bg-blue-400">Welcome to SvelteKit home page</h1>

	<img
		src="/static-webapp/images/velhotes.jpg"
		title="velhotes"
		on:click="{incrementCounter}"
	/>

	<p>now: {data.now}</p>
	<p>counter: {counter} (click the image to increment by 1; click 3 times to navigate with goto())</p>
	<a href="/db?delay_in_seconds=0">navigate to the db page →</a>

</div>
