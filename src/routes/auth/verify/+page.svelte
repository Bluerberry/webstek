
<script lang="ts">

	import { page } from '$app/state'
	import * as Form from '$components/form'
	import { verifySchema } from '$validation/authSchemas'

	let { data } = $props()

</script>

<Form.Root
	form={data.verifyForm}
	schema={verifySchema}
	action="/auth/verify{page.url.search}"
	style="grid"
>
	{#snippet header()}
		<h1> Verify your email </h1>
	{/snippet}

    bleh
	
	{#snippet footer()}
		<Form.Submit> Verify </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>