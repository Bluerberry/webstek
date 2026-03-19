
<script lang="ts">

	import { page } from '$app/state'
	import { loginSchema } from '$validation/authSchemas'
	
	import * as Form from '$components/form'
	import Button from '$components/Button.svelte'

	import type { PageData } from './$types'

	type Props = { data: PageData }
	let { data }: Props = $props()

</script>

<Form.Root
	form={data.loginForm}
	schema={loginSchema}
	action="/auth/login{page.url.search}"
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
	<Button style="link" href="/auth/reset">
		Forgot your password?
	</Button>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	.footer {
		position: fixed;
		bottom: 0;
		padding: $layout-padding;
	}

</style>