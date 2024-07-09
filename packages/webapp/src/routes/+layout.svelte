<script>
import { dev } from '$app/environment';
import '../app.css';

function showTooltip(el, text, placement) {
	//
	tippyInstance = tippy(el, {
		placement,
		content: `
				<div class="w-28 sm:w-40 text-center">
					<p>${text}</p> 
				</div>`,
		allowHTML: true,
	});
	tippyInstance.show(['aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa', 'aaaa']);

	// prettier-ignore
	let x = test ? true : (otherTest ? 1 : 2);

	let x2 = test ? true : otherTest ? 1 : 2;

	matrix(1, 0, 0, 0, 1, 0, 0, 0, 1);

	// prettier-ignore
	matrix(
		  1, 0, 0,
		  0, 1, 0,
		  0, 0, 1
		)

		`template with ${
		    very.very.very.very.very.very.very.very.very.very.very.long.chain


		    
		}`;
}
</script>

<slot />

{#if dev}
	<span class="debug-screens" something="123"></span>
	1<b> 2 </b> 3
{/if}
