
<script lang="ts">

	import { page } from '$app/state'
    import { flowAction } from '$scripts/flow'
	import { registerSchema } from '$validation/authSchemas'
	
	import * as Form from '$components/form'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	form={data.registerForm}
	schema={registerSchema}
	action={flowAction(page.url, 'register')}
	style="grid"
>
	{#snippet above()}
		<h1> Register </h1>
	{/snippet}

	<Form.TextField field="username" label="Username" />
	<Form.TextField field="email" label="Email" />
	<Form.TextField type="password" field="password" label="Password" />

	{#snippet below()}
		<Form.Submit> Register </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>
