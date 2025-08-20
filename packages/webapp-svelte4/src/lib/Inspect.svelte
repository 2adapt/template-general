
<script lang="ts">
	export let value: any = '(missing value)';
	export let title: string = '(missing title)';

	let valueStringified = '';
	let createdAt = Date.now();
	let updatedAt = 0;
	let updatesCount = 0;

	$: {
		if (typeof value !== 'string') {
			try {
				valueStringified = JSON.stringify(value, null, 2);
			} catch (err) {
				let logId = `[inspect-${Date.now()}]`;
				console.log(logId, value);

				valueStringified = 'err.message: ' + err.message;
				valueStringified += `\n\n(the original value was logged to the browser console at ${logId})`;
			}
		}
		else {
			valueStringified = value;
		}

		updatedAt = Date.now();
		updatesCount++;
	}
</script>

<!--<div class="border border-red-400 p-2 rounded-xl w-full">-->
<!--	<div>{title}</div>-->
<!--	<textarea class="w-full h-64 text-xs leading-4 font-mono">{valueStringified}</textarea>-->
<!--</div>-->

<fieldset class="border border-red-400 p-0 w-full ">
	<legend class="mx-auto font-mono">
		xxxinspect: {title}
	</legend>

	<textarea rows="1" class="w-full text-xs leading-4 font-mono">{JSON.stringify({createdAt, updatedAt, updatesCount})}</textarea>
	<textarea class="w-full h-64 text-xs leading-4 font-mono">{valueStringified}</textarea>
</fieldset>
