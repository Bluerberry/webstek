<script lang="ts">

	import { page } from '$app/state'
	import * as Form from '$components/form'
	import { flowAction } from '$scripts/flow'
	import { requestResetPasswordSchema } from '$validation/authSchemas'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	style="grid"
	form={data.requestResetPasswordForm}
	schema={requestResetPasswordSchema}
	action={flowAction(page.url, 'request')}
>
	{#snippet above()}
		<h1> Reset your password </h1>
		<p> Enter the email of the account you'd like to recover </p>
	{/snippet}

	<Form.TextField field="email" label="Email" />

	{#snippet below()}
		<Form.Submit> Request reset </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>
