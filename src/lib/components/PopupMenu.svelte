<script lang="ts">

	import { tick } from 'svelte'
    import theme from '$stores/theme.svelte'

	import type { Snippet } from 'svelte'

	type Props = {
		open?: boolean
		icon: Snippet
		children: Snippet<[{ closeMenu: () => void }]>
	}

	let {
		icon,
		children,
		open = $bindable(false)
	}: Props = $props()

	let wrapperElement: HTMLDivElement
	let iconElement: HTMLButtonElement
	let popupElement: HTMLDivElement

	let iconWidth = $state(0)
	let popDirection = $state<'right' | 'left'>('right')

	function closeMenu() {
		open = false
	}

	async function toggleMenu() {
		open = !open
		if (open) {
			await tick()
			resolveDirection()
		}
	}

	function resolveDirection() {
		if (!popupElement || !wrapperElement) return
		const { left } = wrapperElement.getBoundingClientRect()
		const popupWidth = popupElement.offsetWidth
		popDirection = left + popupWidth <= window.innerWidth ? 'right' : 'left'
	}

	function onDocPointerDown(event: PointerEvent) {
		if (open && wrapperElement && !wrapperElement.contains(event.target as Node)) {
			closeMenu()
		}
	}

	$effect(() => {
		if (iconElement) {
			const resize = new ResizeObserver(() => {
				iconWidth = iconElement.offsetWidth
			})

			resize.observe(iconElement)
			iconWidth = iconElement.offsetWidth
			return () => resize.disconnect()
		}
	})

</script>

<svelte:document onpointerdown={onDocPointerDown} />

<div 
	class="popup-menu theme-{open ? theme.invert() : theme.value}"
	bind:this={wrapperElement} 
	style="--gutter-width: {iconWidth}px"
>
	<button
		class="trigger"
		bind:this={iconElement}
		onclick={toggleMenu}
		aria-haspopup="true"
		aria-expanded={open}
	>
		{@render icon()}
	</button>

	{#if open}
		<div
			class="popup {popDirection}"
			bind:this={popupElement}
			role="dialog"
		>
			{@render children({ closeMenu })}
		</div>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@use 'sass:color';

	@include themed();

	$popup-padding: 0.5rem;

	.popup-menu {
		position: relative;
		display: inline-block;

		.trigger {
			position: relative;
			z-index: 2;

			display: flex;
			align-items: center;
			justify-content: center;

			color: var(--foreground);
			cursor: pointer;
		}

		.popup {
			position: absolute;
			top: -$popup-padding;
			left: -$popup-padding;
			z-index: 1;

			width: max-content;
			padding: $popup-padding calc(var(--gutter-width) + 2*$popup-padding);

			color: var(--foreground);
			background: var(--background);
			box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.5);
			border-radius: $border-radius;

			&.left {
				left: auto;
				right: -$popup-padding;
			}
		}
	}

</style>