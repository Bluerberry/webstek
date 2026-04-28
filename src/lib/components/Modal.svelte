
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

	let dialogElement: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialogElement) return

		if (open) {
			dialogElement.showModal();
		} else if (dialogElement.open) {
			dialogElement.close();
		}
	})

</script>

{#if open}
	<dialog
		class="modal"
		bind:this={dialogElement}
		onclose={() => open = false}
	>
		{@render children()}

		<button 
			type="button" 
			onclick={() => open = false}
		>
			<X />
		</button>
	</dialog>
{/if}

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.modal {
		position: fixed;
		translate: -50% -50%;
		top: 50%;
		left: 50%;

		padding: 3rem;
		border-radius: $border-radius;
		background-color: var(--background);

		&::backdrop {
			background-color: var(--foreground);
			opacity: 50%;
		}

		button {
			position: absolute;
			top: 0.9rem;
			right: 0.9rem;
			width: 1.2rem;
			height: 1.2rem;
			cursor: pointer;

			:global(.lucide) {
				width: 100%;
				height: 100%;
				pointer-events: none;
				color: var(--foreground);
			}
		}
	}

</style>