
<script lang="ts">

	import { page } from '$app/state'
	import { loginSchema } from '$validation/authSchemas'
    import { flowAction, getFlow, withFlow } from '$scripts/flow'
	
	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import { Dot } from '@lucide/svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	style="grid"
	form={data.loginForm}
	schema={loginSchema}
	action={flowAction(page.url, 'login')}
>
	{#snippet above()}
		<h1> Login </h1>
	{/snippet}

	<Form.TextField field="email" label="Email" />
	<Form.TextField type="password" field="password" label="Password" />
	
	{#snippet below()}
		<Form.Submit> Login </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>

<footer>
	<Button style="link" href={withFlow('/auth/register', getFlow(page.url))}>
		Register an account
	</Button>
	<Dot />
	<Button style="link" href={withFlow('/auth/reset/request', getFlow(page.url))}>
		Reset your password
	</Button>
</footer>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	
	$dot-size: 1rem;

	footer {
		position: absolute;
		bottom: 0;

		display: flex;
		align-items: center;
		gap: 0.25rem;

		:global(.lucide) {
			width: $dot-size;
			height: $dot-size;
		}
	}

</style>