<script lang="ts">

	import { page } from '$app/state'
	import toaster from '$stores/toaster.svelte'
	import { gotoWithFlow } from '$scripts/flow'
	import { resetPasswordSchema } from '$validation/authSchemas'

	import * as Form from '$components/form'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	form={data.resetPasswordForm}
	schema={resetPasswordSchema}
	action="?/reset"
	style="grid"
	onUpdated={({ form }) => {
		if (form.valid) {
			toaster.show('Successfully reset password')
			gotoWithFlow(page.url, '/auth/login')
		}
	}}
>
	{#snippet above()}
		<h1> And then finally... </h1>
		<p> Enter your new password. Don't forget it this time! </p>
	{/snippet}

	<Form.TextField field="newPassword" label="New Password" type="password" />

	{#snippet below()}
		<Form.Submit> Reset password </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>
