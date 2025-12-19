 
<script lang="ts">

	import nav from '$stores/nav.svelte'
	import { page } from '$app/state'
	import { quadOut } from 'svelte/easing'
	import { slide } from 'svelte/transition'

	import NavItem from './NavItem.svelte'
	import { Asterisk, ChevronRight } from '@lucide/svelte'
	
	import type { NavData } from './types'

	function checkHasCurrent(item: NavData) {
		return item.path === page.url.pathname
			|| item.children?.some(checkHasCurrent)
	}

	function toggleDropdown() {
		if (searching) return
		transitionDuration = 150
		nav[data.label] = !nav[data.label]
	}

	type Props = {
		data: NavData
		searching: boolean
		found: boolean
	}

	let {
		data,
		searching,
		found
	}: Props = $props()

	let transitionDuration = $state(0)
	let current = $derived(checkHasCurrent(data))
	let open = $derived(nav[data.label] || searching)

	// If current becomes true, permanently open dropdown and disable animation
	$effect(() => {
		if (current) {
			nav[data.label] = true
			transitionDuration = 0
		}
	})

	// If searching becomes true, disable animation
	$effect(() => {	
		if (searching) {
			transitionDuration = 0
		}
	})

</script>

{#if data.path}
	<a
		class='navitem' class:found
		href={data.path}
	>
		{#if current} <Asterisk /> {/if}
		{data.label}
	</a>
{:else if data.children}
	<button
		class='navitem' class:open
		style="--transition-duration: {transitionDuration}ms"
		onclick={toggleDropdown}
	>
		<ChevronRight /> {data.label}
	</button>

	{#if open}
		<div class='children' transition:slide={{ duration: transitionDuration, easing: quadOut }}>
			{#each data.children as child}
				<NavItem data={child} {found} {searching} />
			{/each}
		</div>
	{/if}
{/if}

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@use 'sass:math';
	@include themed();

	$caret-size: 1.4rem;
	$asterisk-size: 0.85rem;

	.navitem {
		display: flex;
		flex-flow: row nowrap;

		position: relative;
		padding: $thin-btn-padding 0;
		padding-left: 2 * $icon-padding + $icon-size;

		cursor: pointer;
		font-size: $l-font;
		color: var(--foreground);

		:global(.lucide) {
			position: absolute;
			translate: 0 -50%;
			left: $icon-padding + math.div($icon-size - $caret-size, 2);
			top: 50%;

			width: $caret-size;
			height: $caret-size;

			pointer-events: none;
			transition: rotate ease-out var(--transition-duration, 150ms);
		}

		&:is(a) :global(.lucide) {
			left: $icon-padding + math.div($icon-size - $asterisk-size, 2);
			width: $asterisk-size;
			height: $asterisk-size;
		}

		&.open :global(.lucide) {
			rotate: 90deg;
		}

		&:hover, &:focus-visible, &.found {
			text-decoration: underline;
		}
	}

	.children {
		margin-left: $icon-padding + $icon-size;
	}

</style>
