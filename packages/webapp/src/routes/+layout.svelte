<script>
import { dev } from '$app/environment';
import "../app.css";
</script>

<slot />
<span class="debug-screens" class:hidden={!dev}></span>
