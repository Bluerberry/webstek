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
		style?: 'grid'
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
		<div class="row">
			{@render header()}
		</div>
	{/if}

	{#if paragraph}
		{@render paragraph()}
	{/if}

	{@render children()}

	{#if footer}
		<div class="row">
			{@render footer()}
		</div>
	{/if}
</form>

<style lang="scss">

	@use '$styles/variables' as *;

	form {
		width: 100%;

		&.grid {
			display: grid;
			grid-template: "left right" auto / max-content auto;
			align-items: center;
			gap: 1rem;
			
			max-width: 30rem;

			.row {
				grid-column: right;
			}
		}

		.row {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 1rem;
			
			&:first-child {
				margin-bottom: 0.5rem;
			}

			&:last-child {
				margin-top: 0.25rem;
			}
		}
	}

</style>