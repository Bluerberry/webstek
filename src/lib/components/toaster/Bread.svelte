<script lang="ts">

	import { X } from '@lucide/svelte';
    import { fade, fly } from 'svelte/transition'
    import { quadOut } from 'svelte/easing'
	import toaster from '$stores/toaster.svelte'

	type Props = {
		id: string
		title: string
		body?: string
	}

	let {
		id,
		title,
		body
	}: Props = $props()

</script>

<div 
	class="bread"
	in:fly={{ duration: 150, y: -20, easing: quadOut }}
	out:fade={{ duration: 150, easing: quadOut }}
>
	<div class="title">
		{title}
		<button type="button" onclick={() => toaster.dismiss(id)}>
			<X />
		</button>
	</div>

	{#if body}
		<p class="body"> {body} </p>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.bread {
		display: flex;
		flex-flow: column nowrap;
		gap: 0.75rem;

		width: 20rem;
		padding: 0.75rem 1rem;
		border: 2px solid var(--foreground);
		border-radius: $border-radius;

		background-color: var(--background);
		box-shadow: 3px 3px 0px 0px var(--muted);

		.title {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 0.75rem;

			color: var(--foreground);
			white-space: nowrap;
			font-size: $l-font;
			font-weight: 550;

			button {
				width: 1rem;
				height: 1rem;
				cursor: pointer;

				:global(.lucide) {
					width: 100%;
					height: 100%;
					pointer-events: none;
					color: var(--foreground);
				}
			}
		}

		.body {
			font-size: $m-font;
			color: var(--muted);
		}
	}

</style>