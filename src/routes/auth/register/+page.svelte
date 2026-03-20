
<script lang="ts">

	import { page } from '$app/state'
	import { registerSchema } from '$validation/authSchemas'
    import { flowAction, getFlow, withFlow } from '$scripts/flow'
	
	import * as Form from '$components/form'
    import Button from '$components/Button.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	style="grid"
	schema={registerSchema}
	form={data.registerForm}
	action={flowAction(page.url, 'register')}
>
	{#snippet above()}
		<h1> Register </h1>
	{/snippet}

	<Form.TextField field="username" label="Username" />
	<Form.TextField field="email" label="Email" />
	<Form.TextField type="password" field="password" label="Password" />

	{#snippet below()}
		<Form.Submit> Register </Form.Submit>
		<Form.Response />
	{/snippet}
</Form.Root>

<div class="footer">
	<Button style="link" href={withFlow('/auth/login', getFlow(page.url))}>
		Login with an existing account
	</Button>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	
	$dot-size: 1rem;

	.footer {
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