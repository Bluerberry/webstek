
<script lang="ts">

	import Bread from './Bread.svelte'
	import toaster from '$stores/toaster.svelte'
	import { flip } from 'svelte/animate'
	import { quadOut } from 'svelte/easing'

</script>

<div class="toaster">
	{#each toaster.queue as data (data.id)}
		<div animate:flip={{ duration: 300, easing: quadOut }}>
			<Bread {...data} />
		</div>
	{/each}
</div>

<style lang="scss">

	.toaster {
		position: fixed;
		z-index: 999;
		right: 1rem;
		top: 1rem;

		display: flex;
		flex-flow: column nowrap;
		gap: 1rem;
	}

</style>