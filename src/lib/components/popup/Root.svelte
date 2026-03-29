<script lang="ts">

	import { tick } from 'svelte'
    import theme from '$stores/theme.svelte'

	import type { Snippet } from 'svelte'

	type Props = {
		icon: Snippet
		title?: string
		children: Snippet<[{ closeMenu: () => void }]>
		open?: boolean
	}

	let {
		icon,
		title,
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
	class:open
	class="popup-menu theme-{open ? theme.invert() : theme.value}"
	style="--icon-width: {iconWidth}px"
	bind:this={wrapperElement} 
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
			role="dialog"
			class="popup {popDirection}"
			bind:this={popupElement}
		>
			{#if title} <h3> {title} </h3> {/if}
			{@render children({ closeMenu })}
		</div>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

	$popup-padding: 0.75rem;

	.popup-menu {
		position: relative;
		display: inline-block;

		.trigger {
			position: relative;

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

			display: flex;
			flex-flow: column nowrap;
			gap: 0.5rem;

			width: max-content;
			padding: $popup-padding;

			color: var(--foreground);
			background: var(--background);
			box-shadow: 2px 2px 3px 0px rgba(0, 0, 0, 0.5);
			border-radius: $border-radius;

			h3 {
				padding-left: calc(var(--icon-width) + $popup-padding);
			}

			&.left {
				left: auto;
				right: -$popup-padding;

				h3 {
					padding-left: 0;
					padding-right: calc(var(--icon-width) + $popup-padding);
				}
			}
		}

		&.open {
			.trigger {
				z-index: 2;
				outline: none;
			}
		}
	}

</style>