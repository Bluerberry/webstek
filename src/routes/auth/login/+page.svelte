
<script lang="ts">

	import { page } from '$app/state'
	import * as Form from '$components/form'
	import { loginSchema } from '$validation/authSchemas'

	let { data } = $props()

</script>

<Form.Root
	form={data.loginForm}
	schema={loginSchema}
	action="/auth/login{page.url.search}"
	style="grid"
>
	{#snippet header()}
		<h1> Login </h1>
	{/snippet}

	<Form.TextField field="email" label="Email" />
	<Form.TextField type="password" field="password" label="Password" />
	
	{#snippet footer()}
		<Form.Submit> Login </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>