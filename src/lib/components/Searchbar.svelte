<script lang="ts">

	import { Search } from '@lucide/svelte'
    import type { KeyboardEventHandler } from 'svelte/elements'

	type Props = {
		query?: string
		placeholder?: string
		onkeydown?: KeyboardEventHandler<HTMLInputElement>
	}

	let {
		query = $bindable(),
		placeholder = 'Search...',
		onkeydown = () => {}
	}: Props = $props()

</script>

<div class="searchbar">
	<input type="text" {placeholder} {onkeydown} bind:value={query} />
	<Search />
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@use 'sass:math';

	$search-size: 1.25rem;

	.searchbar {
		position: relative;
		width: 100%;

		input {
			width: 100%;
			padding: $thin-btn-padding 0;
			padding-right: $icon-padding + $icon-size;

			font-size: $l-font;
			color: var(--foreground);

			&::placeholder {
				color: var(--muted);
			}
		}

		:global(.lucide) {
			position: absolute;
			translate: 0 -50%;
			top: 50%;
			right: math.div($icon-size - $search-size, 2);

			width: $search-size;
			height: $search-size;

			pointer-events: none;
			color: var(--foreground);
		}
	}

</style>