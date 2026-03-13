
<script lang="ts">

	import { page } from '$app/state'
	import * as Form from '$components/form'
	import { registerSchema } from '$validation/authSchemas'

	let { data } = $props()

</script>

<Form.Root
	form={data.registerForm}
	schema={registerSchema}
	action="/auth/register{page.url.search}"
	style="grid"
>
	{#snippet header()}
		<h1> Register </h1>
	{/snippet}

	<Form.TextField field="username" label="Username" />
	<Form.TextField field="email" label="Email" />
	<Form.TextField type="password" field="password" label="Password" />

	{#snippet footer()}
		<Form.Submit> Register </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>
