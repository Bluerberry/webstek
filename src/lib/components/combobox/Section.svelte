
<script lang="ts">

    import type { Snippet } from 'svelte'

    type Props = {
        title?: string
        children: Snippet
    }

    let {
        title,
        children
    }: Props = $props()

</script>

<section>
	{#if title} <h5> {title} </h5> {/if}
	{@render children()}
</section>

<style lang="scss">

    section {
		display: flex;
		flex-flow: column nowrap;

		h5 {
			display: flex;
			flex-flow: row nowrap;
			align-items: baseline;

			color: var(--muted);

			&::after {
				content: '';

				flex: 1;
				margin-left: 0.5rem;
				border-bottom: 1px solid var(--muted);
			}
		}
    }

</style>