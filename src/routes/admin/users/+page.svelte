
<script lang="ts">

	import toaster from '$stores/toaster.svelte'
	import { deleteAccount, demoteAccount, getCollateralDamage, getUsers, promoteAccount } from './users.remote'

    import * as combobox from '$components/combobox'
    import Modal from '$components/Modal.svelte'
	import Button from '$components/Button.svelte'
    import Checkbox from '$components/Checkbox.svelte'
	import Searchbar from '$components/Searchbar.svelte'
	
	import { 
		Check, 
		ChevronLeft, 
		ChevronRight, 
		Ellipsis, 
		Funnel, 
		FunnelX, 
		X
	} from '@lucide/svelte'

	import type { SanitizedUser } from '$scripts/types'
	
	const USERS_PER_PAGE = 25

	let users = $derived(await getUsers())

	let query = $state('')
	let showAdmins = $state(true)
	let showUsers = $state(true)
	let showVerified = $state(true)
	let showUnverified = $state(true)
	let activeFilters = $derived(!showAdmins || !showUsers || !showVerified || !showUnverified)

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

	let pageIndex = $state(0)
	let pageCount = $derived(Math.ceil(filteredUsers.length / USERS_PER_PAGE))
	let pageUsers = $derived(filteredUsers.slice(pageIndex * USERS_PER_PAGE, (pageIndex + 1) * USERS_PER_PAGE))

	let preventPrevPage = $derived(pageIndex <= 0)
	let preventNextPage = $derived(pageIndex >= pageCount - 1)

	let promoteAccountModal: {
		open: boolean,
		user?: SanitizedUser
	} = $state({ open: false })

	let demoteAccountModal: {
		open: boolean,
		user?: SanitizedUser
	} = $state({ open: false })

	let deleteAccountModal: {
		open: boolean,
		user?: SanitizedUser
	} = $state({ open: false })

	$effect(() => {
		if (pageCount > 0) {
			pageIndex = 0
		} else {
			pageIndex = -1
		}
	})

	async function handlePromoteAccount(userId: number) {
		try {
			await promoteAccount(userId).updates(
				getUsers().withOverride(
					current => {
						const target = current.find(user => user.id === userId)
						if (target) target.role = 'admin'
						return current
					}
				)
			)

			toaster.show('Account successfully promoted')
		} catch (error: any) {
			toaster.show('Failed to promote account', error)
		}

		promoteAccountModal.open = false
	}

		async function handleDemoteAccount(userId: number) {
		try {
			await demoteAccount(userId).updates(
				getUsers().withOverride(
					current => {
						const target = current.find(user => user.id === userId)
						if (target) target.role = 'user'
						return current
					}
				)
			)

			toaster.show('Account successfully demoted')
		} catch (error: any) {
			toaster.show('Failed to demote account', error)
		}

		demoteAccountModal.open = false
	}

	async function handleDeleteAccount(userId: number) {
		try {
			await deleteAccount(userId).updates(
				getUsers().withOverride(
					current => {
						return current.filter(
							user => user.id !== userId
						)
					}
				)
			)

			toaster.show('Account successfully deleted')
		} catch (error: any) {
			toaster.show('Failed to delete account', error)
		}

		deleteAccountModal.open = false
	}

</script>

<div class="table">
	<div class="controls">
		<Searchbar placeholder="Search users..." bind:query />
		<combobox.Root title="Filter users">
			{#snippet icon()}
				{#if activeFilters}
					<FunnelX />
				{:else}
					<Funnel />
				{/if}
			{/snippet}

			<combobox.Section title="Role">
				<div class="filter-option">
					Admin 
					<Checkbox bind:checked={showAdmins} /> 
				</div>
				<div class="filter-option">
					User 
					<Checkbox bind:checked={showUsers} /> 
				</div>
			</combobox.Section>

			<combobox.Section title="Email">
				<div class="filter-option">
					Verified 
					<Checkbox bind:checked={showVerified} /> 
				</div>
				<div class="filter-option">
					Unverified 
					<Checkbox bind:checked={showUnverified} /> 
				</div>
			</combobox.Section>
		</combobox.Root>

		<div class="page-controls">
			<Button 
				style="icon"
				disabled={preventPrevPage}
				onclick={() => pageIndex -= 1}
			>
				<ChevronLeft />
			</Button>

			<span> page {pageIndex + 1}/{pageCount} </span>
			
			<Button 
				style="icon"
				onclick={() => pageIndex += 1}
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
	<span></span> <!-- Fill settings column -->

	{#each pageUsers as user (user.id)}
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
			<combobox.Root title="User options">
				{#snippet icon()}
					<Ellipsis />
				{/snippet}

				<combobox.Divider />

				{#if user.role === 'user'}
					<Button style="link" onclick={() => {
					promoteAccountModal.open = true
					promoteAccountModal.user = user
				}}>
						Promote to Admin
					</Button>
				{:else}
					<Button style="link" onclick={() => {
					demoteAccountModal.open = true
					demoteAccountModal.user = user
				}}>
						Demote to User
					</Button>
				{/if}
				
				<Button style="link" onclick={() => {
					deleteAccountModal.open = true
					deleteAccountModal.user = user
				}}>
					Delete account
				</Button>
			</combobox.Root>
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

<Modal bind:open={promoteAccountModal.open}>
	<div id="delete-account">
		<h2> Promoting account </h2>
		<p>
			You are about to promote the account of <b> {promoteAccountModal.user?.username} </b>.
			This will give them the same rights as you.
		</p>

		<div class="row">
			<Button 
				style="outline"
				onclick={() => promoteAccountModal.open = false}
			> Cancel </Button>

			<Button 
				type="submit" 
				onclick={() => handlePromoteAccount(promoteAccountModal.user!.id)}
			> Promote </Button>
		</div>
	</div>
</Modal>

<Modal bind:open={demoteAccountModal.open}>
	<div id="delete-account">
		<h2> Demoting account </h2>
		<p>
			You are about to demote the account of <b> {demoteAccountModal.user?.username} </b>.
		</p>

		<div class="row">
			<Button 
				style="outline"
				onclick={() => demoteAccountModal.open = false}
			> Cancel </Button>

			<Button 
				type="submit" 
				onclick={() => handleDemoteAccount(demoteAccountModal.user!.id)}
			> Demote </Button>
		</div>
	</div>
</Modal>

<Modal bind:open={deleteAccountModal.open}>
	<div id="delete-account">
		{#await getCollateralDamage(deleteAccountModal.user!.id)}
			<span> loading... </span>
		{:then data}
			<h2> Deleting account </h2>
			<p> 
				You are about to delete the account of {deleteAccountModal.user?.username}. 
				This action cannot be undone.

				{#if data.length > 0}
					Along with their personal data, the following will also be deleted:
				{/if}
			</p>

			{#each data as { title, collateral }, i (i)}
				<h3> {title} </h3>
				<ul>
					{#each collateral as item, i (i)}
						<li> {item} </li>
					{/each}
				</ul>
			{/each}

			<div class="row">
				<Button 
					style="outline"
					onclick={() => deleteAccountModal.open = false}
				> Cancel </Button>

				<Button 
					type="submit" 
					onclick={() => handleDeleteAccount(deleteAccountModal.user!.id)}
				> Delete Everything </Button>
			</div>
		{/await}
	</div>
</Modal>

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

			.filter-option {
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				gap: 0.5rem;

				:global(.checkbox) {
					margin-left: auto;
					scale: 0.75;
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

	#delete-account {
		color: var(--foreground);

		h2 {
			margin-bottom: 0.5rem;
		}

		h3, .row {
			margin-top: 1.5rem;
		}

		ul {
			padding-left: 2rem;
		}

		.row {
			display: flex;
			justify-content: end;
			gap: 0.5rem;
		}
	}

</style>