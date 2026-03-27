
<script lang="ts">

	import { getUsers } from '../admin.remote'

	import Searchbar from '$components/Searchbar.svelte'
	import Button from '$components/Button.svelte'

	import { Check, ChevronLeft, ChevronRight, Ellipsis, Funnel, FunnelX, X } from '@lucide/svelte'
    import PopupMenu from '$components/PopupMenu.svelte';
    import Checkbox from '$components/Checkbox.svelte';

	const USERS_PER_PAGE = 25

	let users = $derived(await getUsers())

	let showAdmins = $state(true)
	let showUsers = $state(true)
	let showVerified = $state(true)
	let showUnverified = $state(true)
	let query = $state('')
	let page = $state(0)

	let filteredUsers = $derived(users.filter(user => {
		let formattedQuery = query.trim().toLowerCase()
		return (
			user.id.toString().includes(formattedQuery)
		 || user.username.toLowerCase().includes(formattedQuery) 
		 || user.email.toLowerCase().includes(formattedQuery)
		) && (
			user.role !== 'admin' || showAdmins
		) && (
			user.role !== 'user' || showUsers
		) && (
			!user.verified || showVerified
		) && (
			user.verified || showUnverified
		) 
	}))

	let hiddenUsers = $derived(users.length - filteredUsers.length)
	let pageCount = $derived(Math.ceil(filteredUsers.length / USERS_PER_PAGE))
	let pageUsers = $derived(filteredUsers.slice(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE))
	let preventPrevPage = $derived(page <= 0)
	let preventNextPage = $derived(page >= pageCount - 1)
	let activeFilters = $derived(!showAdmins || !showUsers || !showVerified || !showUnverified)


</script>

<div class="table">
	<div class="controls">
		<Searchbar placeholder="Search users..." bind:query />
		<PopupMenu>
			{#snippet icon()}
				{#if activeFilters}
					<FunnelX />
				{:else}
					<Funnel />
				{/if}
			{/snippet}

			<h3> Filter options </h3>
			<section class="menu-section">
				<h4> Role </h4>
				<div class="option"> <Checkbox bind:checked={showAdmins} /> Admin </div>
				<div class="option"> <Checkbox bind:checked={showUsers} /> User </div>
			</section>
			<section class="menu-section">
				<h4> Email </h4>
				<div class="option"> <Checkbox bind:checked={showVerified} /> Verified </div>
				<div class="option"> <Checkbox bind:checked={showUnverified} /> Unverified </div>
			</section>
		</PopupMenu>

		<div class="page-controls">
			<Button 
				style="icon"
				onclick={() => page -= 1}
				disabled={preventPrevPage}
			>
				<ChevronLeft />
			</Button>

			<span> page {page + 1}/{pageCount} </span>
			
			<Button 
				style="icon" 
				onclick={() => page += 1}
				disabled={preventNextPage}
			>
				<ChevronRight />
			</Button>
		</div>
	</div>

	<span> ID </span>
	<span> Role </span>
	<span> Username </span>
	<span> Email </span>
	<span class="justify-center"> Verified </span>
	<span></span>

	{#each pageUsers as user}
		<span class="cell"> {user.id} </span>
		<span class="cell"> {user.role} </span>
		<span class="cell"> {user.username} </span>
		<span class="cell"> {user.email} </span>
		<span class="cell justify-center">
			{#if user.verified}
				<Check />
			{:else}
				<X />
			{/if}
		</span>

		<span class="cell justify-end">
			<PopupMenu>
				{#snippet icon()}
					<Ellipsis />
				{/snippet}
				
				<h4> User options </h4>
				hello world
			</PopupMenu>
		</span>
	{/each}

	
	<span class="hidden-items">
		{#if users.length > 0 && filteredUsers.length === 0}
			No users match your search
		{:else if hiddenUsers > 0}
			{hiddenUsers} user{hiddenUsers > 1 ? 's' : ''} hidden by search
		{/if}
	</span>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	$table-v-margin: 1.25rem;

	.table {
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: repeat(6, auto);
		place-items: center start;
		column-gap: 3rem;
		row-gap: 0.5rem;

		color: var(--foreground);
		
		.controls {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 0.5rem;

			width: 100%;
			margin-bottom: $table-v-margin;
			grid-column: span 6;

			:global(.lucide) {
				width: 1.25rem;
				height: 1.25rem;
			}

			:global(.searchbar) {
				max-width: 16rem;
			}

			.page-controls {
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				gap: 0.25rem;

				margin-left: auto;
			}

			.menu-section {
				display: flex;
				flex-flow: column nowrap;
				gap: 0.25rem;

				margin-top: 0.75rem;
				
				h4 {
					display: flex;
					align-items: baseline;

					&::after {
						content: '';

						flex: 1;
						margin-left: 0.25rem;
						border-bottom: 1px solid var(--foreground);
					}
				}

				.option {
					display: flex;
					flex-flow: row nowrap;
					align-items: center;
					gap: 0.5rem;

					margin-left: 0.75rem;

					:global(.checkbox) {
						scale: 0.75;
					}
				}
			}
		}

		:global(.lucide) {
			width: 1rem;
			height: 1rem;
		}

		.cell {
			display: flex;
			font-size: $l-font;
		}

		.justify-center {
			justify-self: center;
		}

		.justify-end {
			justify-self: flex-end;
		}

		.hidden-items {
			width: 100%;
			margin-top: $table-v-margin;
			grid-column: span 6;

			color: var(--muted);
			text-align: center;
		}
	}

</style>