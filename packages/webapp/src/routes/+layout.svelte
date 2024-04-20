<script>
import { dev } from '$app/environment';
import "../app.css";
</script>

<slot />

{#if dev}
<span class="debug-screens"></span>
{/if}
