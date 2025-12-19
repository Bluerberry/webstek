<script lang="ts">

	import { goto } from '$app/navigation'
	
	import NavItem from './NavItem.svelte'
	import Searchbar from '$components/Searchbar.svelte'
	
	import type { NavData } from './types'
	import type { KeyboardEventHandler } from 'svelte/elements'

	function cullTree(tree: NavData[], query: string): NavData[] {
		return tree
			.map(item => cullItem(item, query))
			.filter(item => item !== null) 
	}

	function cullItem(item: NavData, query: string): NavData | null {
		if (query === '') return item 

		// Cull paths whose label doesnt match query
		if (item.path) {
			const formattedLabel = item.label.toLowerCase().trim() 
			if (formattedLabel.includes(formattedQuery)) {
				return item 
			}
		}

		// Cull folders whose children were culled
		else if (item.children) {
			const children = cullTree(item.children, query)
			if (children.length > 0) {
				return { ...item, children } 
			}
		}

		return null 
	}

	function countTree(tree: NavData[]): number {
		return tree.reduce((sum, item) => sum + countItem(item), 0)
	}

	function countItem(item: NavData): number {
		return item.children ? countTree(item.children) : 1
	}

	type Props = { navtree: NavData[] }
	let { navtree }: Props = $props()

	let query = $state('')	
	
	const formattedQuery = $derived(query.toLowerCase().trim())
	const culledTree = $derived(cullTree(navtree, formattedQuery))
	const culledSize = $derived(countTree(culledTree))
	const treeSize = $derived(countTree(navtree))

	const hiddenItems = $derived(treeSize - culledSize)
	const searching = $derived(query.trim() !== '')
	const found = $derived(culledSize === 1)

	const onkeydown: KeyboardEventHandler<HTMLInputElement> = event => {
		if (event.key !== 'Enter' || !found) return
		
		// Find leaf node
		let data = culledTree[0]
		while (data.children) data = data.children[0]

		// Goto result
		if (data.path) {
			goto(data.path)
			query = ''
		}
	}

</script>

<div class="navigation">
	<Searchbar placeholder="Search webstek..." {onkeydown} bind:query />

	{#if culledSize > 0}
		<nav>
			{#each culledTree as data}
				<NavItem {data} {searching} {found} />
			{/each}
		</nav>

		{#if hiddenItems > 0}
			<span class="hidden-items">
				{hiddenItems} items hidden by search
			</span>
		{/if}
	{:else}
		<span class="hidden-items">
			No items match your search
		</span>
	{/if}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();
	
	.navigation {
		display: flex;
		flex-flow: column nowrap;
		gap: 0.5rem;

		:global(.searchbar input) {
			padding-left: 2*$icon-padding + $icon-size;
		}

		nav {
			display: flex;
			flex-flow: column nowrap;
			align-items: stretch;
		}

		.hidden-items {
			align-self: center;
			color: var(--muted);
		}
	}

</style>