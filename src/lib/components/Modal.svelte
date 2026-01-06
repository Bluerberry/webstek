
<script lang="ts">
    import { X } from '@lucide/svelte';


	import type { Snippet } from 'svelte'

	type Props = {
		open: boolean
		children: Snippet
	}

	let {
		open = $bindable(false),
		children
	}: Props = $props()

	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return
		if (open) {
			dialog.showModal();
		} if (!open && dialog.open) {
			dialog.close();
		}
	})

</script>

{#if open}
	<dialog class="modal" bind:this={dialog} onclose={() => open = false}>
		<button type="button" onclick={() => open = false}>
			<X />
		</button>

		{@render children()}
	</dialog>
{/if}

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

	.modal {
		position: fixed;
		translate: -50% -50%;
		top: 50%;
		left: 50%;

		padding: 2rem;
		border-radius: $border-radius;
		background-color: var(--background);

		&::backdrop {
			background-color: var(--foreground);
			opacity: 50%;
		}

		button {
			position: absolute;
			top: 0.5rem;
			right: 0.5rem;
			cursor: pointer;

			:global(.lucide) {
				width: 1rem;
				height: 1rem;
				pointer-events: none;
			}
		}
	}

</style>