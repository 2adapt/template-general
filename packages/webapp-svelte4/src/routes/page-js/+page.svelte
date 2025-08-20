<script>
	import { goto } from '$app/navigation';
	import { getDate } from '$lib/utils2.js';
	import SvgFile from '../page-ts/monitor_www__bold.svg';
	import SvgFile2 from '../page-ts/interface_add_circle__miniline.svg';

	export let data;
	const { usage, title } = data;
	let someDate2 = getDate();

	let counter = 0;
	async function incrementCounter() {
		counter++;

		if (counter >= 3) {
			debugger;
			await goto(`/test/page-${counter}`);
		}
	}

</script>

<!--https://svelte.dev/docs/kit/accessibility#Route-announcements-->
<svelte:head>
  <title>{title}</title>
</svelte:head>

<p>isoDate (without types): {someDate2 + 1}</p>
<textarea>{JSON.stringify(usage, null, 2)}</textarea>
<p>counter: {counter} (click the button to increment; will navigtate with goto() when counter reaches 3)</p>
<div><button class="border border-gray-800" on:click="{incrementCounter}">increment</button></div>
<a href="/test/page-{counter}?delay_in_seconds=0">navigate to the "test/page-{counter}" page →</a>

<hr>

<p class="text-blue-600 border rounded-md border-blue-500 ">svg icon with fill</p>
<div class="w-24 stroke-none fill-current text-red-700">
  {@html SvgFile}
</div>

<hr>

<p>svg icon with stroke</p>
<div class="w-24 stroke-current fill-none text-green-700">
  {@html SvgFile2}
</div>

<hr>

<p>image from the sveltekit static assets dir</p>
<div class="w-72 stroke-current fill-none text-green-700">
  <img src="static-webapp/velhotes.jpg" alt="">
</div>
