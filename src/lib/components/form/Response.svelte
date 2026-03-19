
<script lang="ts">

	import { getContext } from 'svelte'
    import { quadOut } from 'svelte/easing'
    import { fade } from 'svelte/transition'

	import type { SuperForm } from 'sveltekit-superforms'

	const superform: SuperForm<any> = getContext('superform')
	const { message } = superform

</script>

{#if $message?.text}
	<span class={$message.type} transition:fade={{ duration: 100, easing: quadOut }}>
		{$message.text}
	</span>
{/if}

<style lang="scss">

	@use '$styles/themes' as *;

	.error {
		color: var(--failure);
	}

	.success {
		color: var(--success);
	}

</style>
