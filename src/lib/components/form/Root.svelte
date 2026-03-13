<script lang="ts" generics="T extends Record<string, any>">

	import { setContext } from 'svelte'
	import { superForm } from 'sveltekit-superforms'
	import { zod4 } from 'sveltekit-superforms/adapters'

	import type { Snippet } from 'svelte'
	import type { SuperValidated, SuperFormEvents } from 'sveltekit-superforms'

	type Events = SuperFormEvents<T, SuperValidated<T>['message']>;

	type Props = {
		form: SuperValidated<T>
		schema: any
		action?: string
		style?: 'grid' | 'centered'
		header?: Snippet
		paragraph?: Snippet
		footer?: Snippet
		children: Snippet
		onError?: Events['onError']
		onResult?: Events['onResult']
		onSubmit?: Events['onSubmit']
		onUpdate?: Events['onUpdate']
		onUpdated?: Events['onUpdated']
	}

	let {
		form,
		schema,
		action,
		style,
		header,
		paragraph,
		footer,
		children,
		onError,
		onResult,
		onSubmit,
		onUpdate,
		onUpdated
	}: Props = $props()

	const superform = superForm(form, {
		validators: zod4(schema),
		onError,
		onResult,
		onSubmit,
		onUpdate,
		onUpdated
	})

	setContext('superform', superform)

</script>

<form
	{action}
	method="POST"
	enctype="multipart/form-data"
	class={style}
	use:superform.enhance
>
	{#if header}
		{@render header()}
	{/if}

	{#if paragraph}
		{@render paragraph()}
	{/if}

	{@render children()}

	{#if footer}
		<div class="footer">
			{@render footer()}
		</div>
	{/if}
</form>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	form {
		width: 100%;

		&.grid {
			display: grid;
			grid-template: "left right" auto / max-content auto;
			align-items: center;
			gap: 1rem;
			
			max-width: 30rem;

			:global(> h1), :global(> p), .footer {
				grid-column: right;
			}
		}

		&.centered {
			display: flex;
			flex-flow: column nowrap;
			align-items: center;
			max-width: 30rem;

			:global(> h1), :global(> p) {
				align-self: flex-start;
			}
		}

		:global(> h1) {
			margin-bottom: 0.5rem;
		}

		:global(> p) {
			margin-bottom: 2rem;
		}

		.footer {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 1rem;

			margin-top: 0.25rem;
		}
	}

</style>