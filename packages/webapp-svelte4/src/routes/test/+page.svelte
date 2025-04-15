<script>
	import SvgFile from './monitor_www__bold.svg';
	import SvgFile2 from './interface_add_circle__miniline.svg';
</script>

<p>svg icon with fill</p>
<div class="w-24 stroke-none fill-current text-red-700">
{@html SvgFile}
</div>

<p>svg icon with stroke</p>
<div class="w-24 stroke-current fill-none text-green-700">
	{@html SvgFile2}
</div>


<p>image from the sveltekit static assets dir</p>
<div class="w-72 stroke-current fill-none text-green-700">
	<img src="static-webapp/velhotes.jpg" alt="">
</div>
