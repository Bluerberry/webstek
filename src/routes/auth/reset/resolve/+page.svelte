<script lang="ts">

	import { page } from '$app/state'
	import toaster from '$stores/toaster.svelte'
    import Button from '$components/Button.svelte'
	import { resetPasswordSchema } from '$validation/authSchemas'
	import { flowAction, getFlow, gotoWithFlow, withFlow } from '$scripts/flow'

	import * as Form from '$components/form'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

	let critical = $state(false)

</script>

<Form.Root
	style="grid"
	form={data.resetPasswordForm}
	schema={resetPasswordSchema}
	action={flowAction(page.url, 'resolve')}
	onUpdated={({ form }) => {
		if (form.valid) {
			toaster.show('Successfully reset password')
			gotoWithFlow(page.url, '/auth/login')
		} else if (form.message?.type === 'critical') {
			critical = true
		}
	}}
>
	{#snippet above()}
		<h1> And then finally... </h1>
		<p> Enter your new password. Don't forget it this time! </p>
	{/snippet}

	<Form.TextField field="newPassword" label="New Password" type="password" />

	{#snippet below()}
		{#if critical}
			<Button href={withFlow('/auth/reset/request', getFlow(page.url))}>
				Restart recovery
			</Button>
		{:else}
			<Form.Submit> Reset password </Form.Submit>
		{/if}
		
		<Form.Response />
	{/snippet}
</Form.Root>
