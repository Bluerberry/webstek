
<script lang="ts">

	import { page } from '$app/state'
	import { fly } from 'svelte/transition'
	import { cubicInOut } from 'svelte/easing'

	let { children } = $props()

	const flyIn = $derived({ x: 40, duration: 300, delay: 300, easing: cubicInOut })
	const flyOut = $derived({ x: -40, duration: 300, easing: cubicInOut })


</script>

<div class="outer">
	{#key page.url.pathname}
		<div class="inner" in:fly={flyIn} out:fly={flyOut}>
			{@render children()}
		</div>
	{/key}
</div>

<style lang="scss">

	.outer {
		position: relative;
		width: 100%;
		height: 100%;

		.inner {
			position: absolute;
			inset: 0;

			display: flex;
			flex-flow: column nowrap;
			align-items: center;
			justify-content: center;
		}
	}

</style>