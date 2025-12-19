
<script lang="ts">

	import type { Snippet } from 'svelte'
    import type { MouseEventHandler } from 'svelte/elements'

	type Props = {
		type?: 'button' | 'submit'
		style?: 'default' | 'outline' | 'icon'
		disabled?: boolean
		loading?: boolean
		href?: string
		onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
		children: Snippet
	}

	let {
		type = 'button',
		style = 'default',
		disabled = false,
		loading = false,
		href,
		onclick,
		children
	}: Props = $props()

</script>

{#if href}
	<a
		{href}
		{onclick}
		class="button {style}"
		class:disabled={ disabled || loading }
	>
		<div class="children" class:hide={ loading }>
			{@render children()}
		</div>

		{#if loading}
			<div class="spinner"></div>
		{/if}
	</a>
{:else}
	<button
		{type}
		{onclick}
		class="button {style}"
		class:disabled={ disabled || loading }
	>
		<div class="children" class:hide={ loading }>
			{@render children()}
		</div>

		{#if loading}
			<div class="spinner"></div>
		{/if}
	</button>
{/if}

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

	.button {
		position: relative;
		display: inline-block;

		padding: $thin-btn-padding $thick-btn-padding;
		border: 2px solid var(--foreground);
		border-radius: $border-radius;

		font-size: $l-font;
		text-wrap: nowrap;
		cursor: pointer;

		&.default {
			color: var(--background);
			background: var(--foreground);
		}
		
		&.outline {
			color: var(--foreground);
			background: var(--background);
		}

		&.icon {
			color: var(--muted);
			background: var(--background);
			border-color: var(--background);
			transition: color ease-out 100ms;
		}

		&:hover, &:focus-visible {
			text-decoration: underline;

			&.icon {
				color: var(--foreground);
			}
		}

		.children {
			display: flex;
			flex-flow: row nowrap;
			gap: $icon-padding;
		}

		.spinner {
			position: absolute;
			translate: -50% -50%;
			top: 50%;
			left: 50%;

			width: $m-font;
			height: $m-font;
			border-radius: 50%;

			animation: spin 1s linear infinite;
		}
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

</style>