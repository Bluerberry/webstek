
<script lang="ts">

	import { page } from '$app/state'
    import { flowAction, redirectWithFlow } from '$scripts/flow'
	import { loginSchema } from '$validation/authSchemas'
	
	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import { Dot } from '@lucide/svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	form={data.loginForm}
	schema={loginSchema}
	action={flowAction('login', page.url)}
	style="grid"
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

<div class="footer">
	<Button style="link" href={redirectWithFlow(page.url, 303, '/auth/register')}>
		Register an account
	</Button>
	<Dot />
	<Button style="link" href={redirectWithFlow(page.url, 303, '/auth/reset')}>
		Reset your password
	</Button>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	
	$dot-size: 1rem;

	.footer {
		position: fixed;
		bottom: 0;

		display: flex;
		align-items: center;
		gap: 0.25rem;

		padding: $layout-padding;

		:global(.lucide) {
			width: $dot-size;
			height: $dot-size;
		}
	}

</style>