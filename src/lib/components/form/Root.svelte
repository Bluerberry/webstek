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
		children: Snippet
		above?: Snippet
		below?: Snippet
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
		children,
		above,
		below,
		onError,
		onResult,
		onSubmit,
		onUpdate,
		onUpdated
	}: Props = $props()

	const formId = crypto.randomUUID()
	const superform = superForm(form, {
		validators: zod4(schema),
		id: formId,
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
	id={formId}
	method="POST"
	enctype="multipart/form-data"
	use:superform.enhance
></form>

<div class="form {style}" >
	{#if above}
		<div class="row above">
			{@render above()}
		</div>
	{/if}

	{@render children()}

	{#if below}
		<div class="row below">
			{@render below()}
		</div>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.form {
		width: 100%;

		&.grid {
			display: grid;
			grid-template: "left right" auto / max-content auto;
			align-items: center;
			gap: 1rem;
			
			max-width: 32rem;

			.row {
				grid-column: right;
			}
		}

		&.centered {
			display: flex;
			flex-flow: column nowrap;
			align-items: center;
			gap: 1rem;

			max-width: 32rem;
		}

		.row :global(p) {
			margin-top: 0.5rem;
		}

		.above {
			display: flex;
			flex-flow: column nowrap;
			gap: 0.5;

			margin-bottom: 0.75rem;
		}
		
		.below {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 1rem;

			margin-top: 0.75rem;
		}
	}

</style>