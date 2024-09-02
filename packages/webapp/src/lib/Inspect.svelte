<script>
export let value;
//export let value2;
export let title = '';
let valueStringified = '';

$: {
	try {
		valueStringified = JSON.stringify(value, null, 2);
	} catch (err) {
		valueStringified = err.message;
	}
}
</script>

<div class="border border-red-400 p-2 rounded-xl">
	<div>{title}</div>
	<textarea class="w-full h-64 text-xs leading-4 font-mono">{valueStringified}</textarea>
</div>
