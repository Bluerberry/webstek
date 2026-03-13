
<script lang="ts">

	import { page } from '$app/state'
	import { enhance } from '$app/forms'
	import * as Form from '$components/form'
	import { verifySchema } from '$validation/authSchemas'
	import Button from '$components/Button.svelte';

	let { data } = $props()

	let now = $state(Date.now())
	const remainingCooldown = $derived(data.cooldown - now)
	const onCooldown = $derived(remainingCooldown > 0)
	const cooldownLabel = $derived(() => {
		const total = Math.ceil(remainingCooldown / 1000)
		const m = Math.floor(total / 60)
		const s = total % 60
		return `${m}:${String(s).padStart(2, '0')}`
	})

	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000)
		return () => clearInterval(interval)
	})

</script>

<Form.Root
	form={data.verifyForm}
	schema={verifySchema}
	action="?/verify{page.url.search}"
>
	{#snippet header()}
		<h1> Verify your email </h1>
	{/snippet}

	{#snippet paragraph()}
		<p> To ensure the safety of your account, Webstek requires you to verify your email to access most features. </p>
	{/snippet}

	<Form.CodeInput field="code" />

	{#snippet footer()}
		<Form.Response />
	{/snippet}
</Form.Root>

<form method="POST" action="?/resend{page.url.search}" use:enhance>
	<Button type="submit" style="outline" disabled={onCooldown}>
		{onCooldown ? cooldownLabel() : 'Resend email'}
	</Button>
</form>