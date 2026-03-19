<script lang="ts">
	
	import { onMount } from 'svelte'
    import { page } from '$app/state'
	import toaster from '$stores/toaster.svelte'
	import { requestCode } from './reset.remote'
    import { redirectWithFlow } from '$scripts/flow'
	import { requestResetSchema, verifyResetSchema, resetPasswordSchema } from '$validation/authSchemas'

	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'
	import Carrousel from '$components/Carrousel.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

	let carrouselIndex = $state(data.user === undefined ? 0 : 1)
	let email: string | undefined = $state()
	let code: string | undefined = $state()
	let cooldownUntil = $state(0)
	let now = $state(Date.now())
 
	const onCooldown = $derived(cooldownUntil > now)
	const cooldownSeconds = $derived(Math.ceil((cooldownUntil - now) / 1000))
	const cooldownLabel = $derived(
		`Wait ${Math.floor(cooldownSeconds / 60)}:${String(cooldownSeconds % 60).padStart(2, '0')} to resend`
	)

	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000)
		return () => clearInterval(interval)
	})

	async function handleCodeRequest() {
		if (email === undefined) return
		const cooldown = await requestCode(email)
		if (cooldown) cooldownUntil = cooldown
	}

	// If the user is logged in, skip step 1
	onMount(() => {
		if (data.user) {
			email = data.user.email
			handleCodeRequest()
		}
	})

</script>

<Carrousel bind:index={carrouselIndex} snippets={[requestStep, verifyStep, resetStep]} />

{#snippet requestStep()}
	<Form.Root
		form={data.requestResetForm}
		schema={requestResetSchema}
		action="?/request"
		style="grid"
		onUpdated={({ form }) => {
			if (form.valid) {
				email = form.data.email
				handleCodeRequest()
				carrouselIndex += 1
			}
		}}
	>
		{#snippet above()}
			<h2> Reset your password </h2>
			<p> Enter the email of the account you'd like to recover </p>
		{/snippet}

		<Form.TextField field="email" label="Email" />

		{#snippet below()}
			<Form.Submit> Request reset </Form.Submit>
			<Form.Response />
		{/snippet}
	</Form.Root>
{/snippet}

{#snippet verifyStep()}
	<Form.Root
		form={data.verifyResetForm}
		schema={verifyResetSchema}
		action="?/verify"
		style="centered"
		onUpdated={({ form }) => {/*  */
			if (form.valid) {
				code = form.data.code
				carrouselIndex += 1
			}
		}}
	>
		{#snippet above()}
			<h2> Verify it's you </h2>
			<p> Enter the 6-digit code we sent to {email} </p>
		{/snippet}

		<Form.HiddenField field="email" value={email} />
		<Form.CodeInput field="code" />

		{#snippet below()}
			<Button
				type="button"
				disabled={onCooldown}
				onclick={() => handleCodeRequest()}
			>
				{onCooldown ? cooldownLabel : 'Resend email'}
			</Button>
			
			<Form.Response />
		{/snippet}
	</Form.Root>
{/snippet}

{#snippet resetStep()}
	<Form.Root
		form={data.resetPasswordForm}
		schema={resetPasswordSchema}
		action="?/reset"
		style="grid"
		onUpdated={({ form }) => {
			if (form.valid) {
				toaster.show('Successfully reset password')
				redirectWithFlow(page.url, 303, '/auth/login')
			}
		}}
	>
		{#snippet above()}
			<h2> Reset Your Password </h2>
			<p> Enter your new password. Don't forget it this time! </p>
		{/snippet}

		<Form.HiddenField field="email" value={email} />
		<Form.HiddenField field="code" value={code} />
		<Form.TextField field="newPassword" label="New Password" type="password" />

		{#snippet below()}
			<Form.Submit> Reset password </Form.Submit>
			<Form.Response />
		{/snippet}
	</Form.Root>
{/snippet}