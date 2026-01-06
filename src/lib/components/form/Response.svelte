
<script lang="ts">

    import { page } from '$app/state'
	import { getContext } from 'svelte'
    import { quadOut } from 'svelte/easing'
    import { fade } from 'svelte/transition'
	import type { SuperForm } from 'sveltekit-superforms'

	const superform: SuperForm<any> = getContext('superform')
	const { message } = superform

	const error = $derived(page.form && !page.form.valid)

</script>

{#if $message}
	<span class:error transition:fade={{ duration: 100, easing: quadOut }}>
		{$message}
	</span>
{/if}

<style lang="scss">

	@use '$styles/themes' as *;
	@include themed();

	.error {
		color: var(--failure);
	}

</style>
