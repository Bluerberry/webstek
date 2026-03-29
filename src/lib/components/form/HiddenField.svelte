
<script lang="ts" generics="T extends Record<string, any>">

	import { getContext } from 'svelte'
	import { formFieldProxy } from 'sveltekit-superforms'

	import type { SuperForm, FormPathLeaves } from 'sveltekit-superforms'

	type Props = { field: FormPathLeaves<T>, value?: any }
	let { field, value: external }: Props = $props()

	const superform: SuperForm<T> = getContext('superform')
	const fieldId = crypto.randomUUID()
	const formId = superform.formId

	// svelte-ignore state_referenced_locally
	const { value } = formFieldProxy(superform, field)

	$effect(() => {
		if (external !== undefined) {
			$value = external
		}
	})

</script>

<input hidden
	id={fieldId}
	name={field}
	form={$formId}
	bind:value={$value}
/>
