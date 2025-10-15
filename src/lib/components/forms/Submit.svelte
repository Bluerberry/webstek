
<script lang="ts" generics="T extends Record<string, unknown>">

    import { getContext } from "svelte";
    import type { SuperForm } from "sveltekit-superforms";

    const superform: SuperForm<T> = getContext("superform");
    const { message } = superform;

</script>

<div>
    <button> Submit </button>
    <span> {$message} </span>
</div>
