
<script lang="ts">

	import { resolve } from '$app/paths'

	import type { Snippet } from 'svelte'
    import type { MouseEventHandler } from 'svelte/elements'

	type Props = {
		type?: 'button' | 'submit'
		style?: 'default' | 'outline' | 'link' | 'icon'
		disabled?: boolean
		loading?: boolean
		href?: string
		form?: string
		aria?: string
		onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
		children: Snippet
	}

	let {
		type = 'button',
		style = 'default',
		disabled = false,
		loading = false,
		href,
		form,
		aria: label,
		onclick,
		children
	}: Props = $props()

</script>

{#if href}
	{#if disabled || loading}
		<span
			role="link"
			class="button {style} disabled"
			aria-disabled="true"
			aria-label={label}
		>
			<div class="children" class:hide={ loading }>
				{@render children()}
			</div>

			{#if loading}
				<div class="spinner"></div>
			{/if}
		</span>
	{:else}
		<a
			href={resolve(href as any)}
			{onclick}
			aria-label={label}
			class="button {style}"
		>
			<div class="children">
				{@render children()}
			</div>
		</a>
	{/if}
{:else}
	<button
		{type}
		{form}
		{onclick}
		class="button {style}"
		class:disabled={ disabled || loading }
		disabled={ disabled || loading }
		aria-disabled={ disabled || loading }
		aria-label={label}
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

	.button {
		position: relative;
		display: inline-block;

		padding: $thin-btn-padding $thick-btn-padding;
		border: 2px solid var(--foreground);
		border-radius: $border-radius;

		cursor: pointer;
		text-wrap: nowrap;
		font-size: $l-font;

		// Overwritten when not disabled
		pointer-events: none;
		opacity: 50%;

		&.default {
			color: var(--background);
			background: var(--foreground);

			.spinner {
				border: 2px solid var(--background);
				border-top-color: transparent;
			}
		}
		
		&.outline {
			color: var(--foreground);
			background: var(--background);

			.spinner {
				border: 2px solid var(--foreground);
				border-top-color: transparent;
			}
		}

		&.link, &.icon {
			padding: 0;
			border: none;
			font-size: $m-font;
			color: var(--foreground);

			.spinner {
				border: 2px solid var(--foreground);
				border-top-color: transparent;
			}
		}

		&:not(.icon) {
			outline: none;

			&:hover, &:focus {
				text-decoration: underline;
			}
		}

		&:not(.disabled) {
			pointer-events: all;
			opacity: 100%;
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

		.hide {
			visibility: hidden;
		}
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

</style>