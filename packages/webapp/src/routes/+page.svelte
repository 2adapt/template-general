<script>
export let data;

let now = data.now;
let counter = 0;
function incrementCounter() {
	counter++;
}
</script>

<h1>Welcome to SvelteKit home page</h1>
<p class="bg-blue-300">
	Visit
	<a
		href="https://kit.svelte.dev"
		data-x
	>
		kit.svelte.dev
	</a>
	to read the documentation
</p>

<img
	src="/static-webapp/images/velhotes.jpg"
	xalt="velhotes"
	on:click="{incrementCounter}"
/>

<p>now: {now}</p>
<p>xcounter: {counter}</p>

<a href="/hello">go to hello page -></a>
