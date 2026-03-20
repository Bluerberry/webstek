<script lang="ts">

	import { onMount } from 'svelte'
	import { page } from '$app/state'
    import toaster from '$stores/toaster.svelte'
	import { requestCode } from './verify.remote'
	import { verifyCodeSchema } from '$validation/authSchemas'
    import { flowAction, getFlow, gotoDestination } from '$scripts/flow'

	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

	let cooldownUntil = $state(0)
	let now = $state(Date.now())

	const remainingCooldown = $derived(cooldownUntil - now)
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

	async function handleCodeRequest() {
		const intent = page.url.searchParams.get('intent') ?? undefined
		const cooldown = await requestCode(intent)
		if (cooldown) cooldownUntil = cooldown
	}

	onMount(() => {
		handleCodeRequest()
	})

</script>

<Form.Root
	style="centered"
	form={data.verifyForm}
	schema={verifyCodeSchema}
	action={flowAction(page.url, 'verify')}
	onUpdated={({ form }) => {
		if (form.valid) {
			const { intent } = getFlow(page.url)
			if (intent === 'register') {
				toaster.show('Successfully registered')
			} else {
				toaster.show('Successfully verified email')
			}

			gotoDestination(page.url, '/')
		}
	}}
>
	{#snippet above()}
		<h2> Verify your email </h2>
		<p> To ensure the safety of your account, Webstek requires you to verify your email to access most features. </p>
	{/snippet}

	<Form.CodeInput field="code" />

	{#snippet below()}
		<Button style="default" disabled={onCooldown} onclick={handleCodeRequest}>
			{onCooldown ? cooldownLabel() : 'Resend email'}
		</Button>

		<Form.Response />
	{/snippet}
</Form.Root>