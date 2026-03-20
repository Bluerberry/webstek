<script lang="ts">
	
	import { onMount } from 'svelte'
    import { page } from '$app/state'
	import { requestCode } from '../reset.remote'
    import { flowAction, getFlow, withFlow } from '$scripts/flow'
	import { verifyCodeSchema } from '$validation/authSchemas'

	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

	let now = $state(Date.now())
	let cooldownUntil = $state(0)
	let critical = $state(false)
 
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
		const cooldown = await requestCode()
		if (cooldown) cooldownUntil = cooldown
	}

	onMount(() => {
		handleCodeRequest()
	})

</script>

<Form.Root
	style="centered"
	form={data.verifyCodeForm}
	schema={verifyCodeSchema}
	action={flowAction(page.url, 'verify')}
	onUpdated={({ form }) => {
		if (form.message?.type === 'critical') {
			critical = true
		}
	}}
>
	{#snippet above()}
		<h1> Verify it's you </h1>
		<p> Enter the 6-digit code we sent to you </p>
	{/snippet}

	<Form.CodeInput field="code" />

	{#snippet below()}
		{#if critical}
			<Button href={withFlow('/auth/reset/request', getFlow(page.url))}>
				Restart recovery
			</Button>
		{:else}
			<Button
				disabled={onCooldown}
				onclick={() => handleCodeRequest()}
			>
				{onCooldown ? cooldownLabel : 'Resend email'}
			</Button>
		{/if}
		
		<Form.Response />
	{/snippet}
</Form.Root>
