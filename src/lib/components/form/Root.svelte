<script lang="ts" generics="T extends Record<string, any>">

	import { setContext } from 'svelte'
	import { superForm } from 'sveltekit-superforms'
	import { zod4 } from 'sveltekit-superforms/adapters'

	import type { Snippet } from 'svelte'
	import type { SuperValidated } from 'sveltekit-superforms'

	type Props = {
		form: SuperValidated<T>
		schema: any
		action?: string
		header?: Snippet
		footer?: Snippet
		children: Snippet
	}

	let {
		form,
		schema,
		action,
		header,
		footer,
		children,
	}: Props = $props()

	const superform = superForm(form, {
		validators: zod4(schema)
	})

	setContext('superform', superform)

</script>

<form
	{action}
	method="POST"
	enctype="multipart/form-data"
	use:superform.enhance
>
	{#if header}
		<div class="row">
			{@render header()}
		</div>
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
		display: grid;
		grid-template: "left right" auto / max-content auto;
		align-items: center;
		gap: 1rem;

		width: 100%;
		max-width: 30rem;

		.row {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			grid-column: right;
			gap: 1rem;
			
			&:first-child {
				margin-bottom: 0.5rem;
			}

			&:last-child {
				margin-top: 0.5rem;
			}
		}
	}

</style>