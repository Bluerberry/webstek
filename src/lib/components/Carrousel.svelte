
<script lang="ts">

	import { fly } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	import type { Snippet } from 'svelte'

	type Props = { 
		snippets: Snippet[]
		index?: number
		loop?: boolean
	}

	let { 
		snippets,
		index = $bindable(0),
		loop = true
	}: Props = $props()

	let direction = $state(1)
	let snippet = $derived(snippets[index])

	const flyParams = (direction: number) => ({
		x: direction * 40,
		duration: 300,
		easing: cubicInOut
	})

</script>

<div class="carrousel">
	{#key index}
		<div class="wrapper"
			in:fly={{ ...flyParams(direction), delay: 300 }}
			out:fly={{ ...flyParams(-direction) }}
		>
			{@render snippet()}
		</div>
	{/key}
</div>

<style lang="scss">

	.carrousel {
		position: relative;
		overflow: show;

		.wrapper {
			position: absolute;
			translate: -50% -50%;
			width: max-content;
		}
	}

</style>
