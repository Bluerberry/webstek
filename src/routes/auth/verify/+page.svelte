
<script lang="ts">

	import { page } from '$app/state'
	import { enhance } from '$app/forms'
	import * as Form from '$components/form'
	import { verifySchema } from '$validation/authSchemas'

	let { data } = $props()

	let now = $state(Date.now())

	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000)
		return () => clearInterval(interval)
	})

	let cooldownRemaining = $derived(Math.max(0, new Date(data.cooldownEndsAt).getTime() - now))
	let onCooldown = $derived(cooldownRemaining > 0)
	let cooldownSeconds = $derived(Math.ceil(cooldownRemaining / 1000))

</script>

<Form.Root
	form={data.verifyForm}
	schema={verifySchema}
	action="/auth/verify?/verify{page.url.search}"
	style="grid"
>
	{#snippet header()}
		<h1> Verify your email </h1>
	{/snippet}

	<Form.TextField field="code" label="Verification Code" />

	{#snippet footer()}
		<Form.Submit>Verify</Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>

<form method="POST" action="/auth/verify?/resend{page.url.search}" use:enhance>
	<button type="submit" disabled={onCooldown}>
		{onCooldown ? `Resend in ${cooldownSeconds}s` : 'Resend email'}
	</button>
</form>