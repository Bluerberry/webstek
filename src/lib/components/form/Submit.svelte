
<script lang="ts">

	import Button from '$components/Button.svelte'
    
	import { getContext } from 'svelte'
    
	import type { Snippet } from 'svelte'
	import type { SuperForm } from 'sveltekit-superforms'

	type Props = { children: Snippet }
	let { children }: Props = $props()

	const superform: SuperForm<any> = getContext('superform')
	const { submitting } = superform

</script>

<Button type="submit" loading={$submitting}>
	{@render children()}
</Button>