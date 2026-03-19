
<script lang="ts">

	import { page } from '$app/state'
	import { enhance } from '$app/forms'
    import { flowAction } from '$scripts/flow'
	import { verificationSchema } from '$validation/authSchemas'

	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

	let now = $state(Date.now())

	const remainingCooldown = $derived(data.cooldown - now)
	const onCooldown = $derived(remainingCooldown > 0)
	const cooldownLabel = $derived(() => {
		const total = Math.ceil(remainingCooldown / 1000)
		const m = Math.floor(total / 60)
		const s = total % 60
		return `Wait ${m}:${String(s).padStart(2, '0')} to resend`
	})

	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000)
		return () => clearInterval(interval)
	})

</script>

<Form.Root
	form={data.verifyForm}
	schema={verificationSchema}
	action={flowAction('verify', page.url)}
	style="centered"
>
	{#snippet above()}
		<h1> Verify your email </h1>
		<p> To ensure the safety of your account, Webstek requires you to verify your email to access most features. </p>
	{/snippet}

	<Form.CodeInput field="code" />

	{#snippet below()}
		<form method="POST" action={flowAction('resend', page.url)} use:enhance>
			<Button type="submit" style="default" disabled={onCooldown}>
				{onCooldown ? cooldownLabel() : 'Resend email'}
			</Button>
		</form>

		<Form.Response />
	{/snippet}
</Form.Root>
