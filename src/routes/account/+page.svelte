
<script lang="ts">
	
	import * as Form from '$components/form'
	import Modal from '$components/Modal.svelte'
	import Button from '$components/Button.svelte'
    import Checkbox from '$components/Checkbox.svelte';
	import { Dot } from '@lucide/svelte'
	
	import { getSessions, endSession, setCollectMetadata, getCollateralDamage, deleteAccount } from './account.remote.js'
    import { changeEmailSchema, changePasswordSchema, changeUsernameSchema } from '$validation/authSchemas.js';
    import toaster from '$stores/toaster.svelte.js';
    import { goto } from '$app/navigation';

	let { data } = $props()

	let usernameModal = $state(false)
	let emailModal = $state(false)
	let passwordModal = $state(false)
	let deleteAccountModal = $state(false)

	function formatMetadata(country?: string, browserName?: string, browserVersion?: string) {
		let metadata: string;

		if (country) {
			metadata = country;
			if (browserName) metadata += `, ${browserName}`
		} else if (browserName) {
			metadata = browserName
		} else {
			return 'No data'
		}

		if (browserVersion) {
			metadata += ` ${browserVersion}`
		}

		return metadata
	}

	async function handleEndSession(sessionId: string) {
		try {
			await endSession(sessionId).updates(
				getSessions().withOverride( 
					current => current.filter(session => session.id !== sessionId)
				)
			)

			toaster.show('Session successfully ended')
		} catch (error: any) {
			toaster.show('Failed to end session', error)
		}
	}

	async function handleSetCollectMetadata() {
		try {
			await setCollectMetadata(data.user.collectMetadata).updates(
				getSessions().withOverride(
					current => {
						if (data.user.collectMetadata) {
							return current
						}

						return current.map(session => ({
							...session,
							country: undefined,
							browserName: undefined,
							browserVersion: undefined
						}))
					}
				)
			)

			if (data.user.collectMetadata) {
				toaster.show('Enabled metadata collection')
			} else {
				toaster.show('Disabled metadata collection', 'All known metadata has been deleted')
			}

		} catch (error: any) {
			if (data.user.collectMetadata) {
				toaster.show('Failed to enable metadata collection')
			} else {
				toaster.show('Failed to disable metadata collection')
			}
		}
	}

	async function handleDeleteAccount() {
		try {
			await deleteAccount()
			toaster.show('Account successfully deleted')
			goto('/', { replaceState: true, invalidateAll: true });
		} catch (error: any) {
			toaster.show('Failed to delete account', error)
		}
	}

</script>

<div class="wrapper">
	<section>
		<h1> Account </h1>
		<div class="table">

			<!-- USERNAME -->
			<span class="label"> Username </span>
			<span class="cell"> {data.user.username} </span>
			<Button style="link" onclick={() => usernameModal = true}> Change </Button>

			<!-- EMAIL -->
			<span class="label"> Email </span>

			<div class="row">
				<span class="cell"> {data.user.email} </span>
				{#if data.user.verified}
					<span class="verified success"> Verified </span>
				{:else}
					<span class="verified failure"> Unverified </span>
				{/if}
			</div>

			<div class="row">
				<Button style="link" onclick={() => emailModal = true}> Change </Button>
				{#if !data.user.verified}
					<Dot />
					<Button style='link' href="/auth/verify"> Verify </Button>
				{/if}
			</div>

			<!-- PASSWORD -->
			<span class="label"> Password </span>
			<span class="cell"> ●●●●●●●● </span>

			<div class="row">
				<Button style="link" onclick={() => passwordModal = true}> Change </Button>
				<Dot />
				<Button style="link" disabled={!data.user.verified}> Recover </Button>
			</div>
		</div>
	</section>

	<section>
		<h2> Sessions </h2>

		<div class="table">
			<span class="label"> Metadata </span>
			<span class="label" style="grid-column: span 2"> Last Activity </span>

			{#each await getSessions() as session}
				{@const metadata = formatMetadata(session.country, session.browserName, session.browserVersion)}
				<span class="cell" class:muted={metadata === 'No data'}>
					{metadata}
				</span>

				<span class="cell"> {session.lastVerifiedAt.toDateString()} </span>

				{#if session.id === data.session.id}
					<span class="label muted"> Your current session </span>
				{:else}
					<Button style="link" onclick={() => handleEndSession(session.id)}>
						End this session
					</Button>
				{/if}
			{/each}
		</div>
	</section>

	<section>
		<h2> Settings </h2>

		<div class="setting">
			<h3> Collect session metadata </h3>
			<p class="muted"> Webstek collects session metadata with the sole purpose of displaying it above. Disabling this will automatically delete all previously known metadata. </p>
			<Checkbox bind:checked={data.user.collectMetadata} onchange={handleSetCollectMetadata} />
		</div>

		<div class="setting">
			<h3> Delete account </h3>
			<p class="muted"> Deleting your account will <i>irrevocably</i> delete all data related to you. Like for real. </p>
			<Button onclick={() => deleteAccountModal = true}> Delete Account </Button>
		</div>
	</section>
</div>

<Modal bind:open={usernameModal}>
	<Form.Root
		style="grid"
		action="?/change-username"
		form={data.changeUsernameForm}
		schema={changeUsernameSchema}
		onResult={({ result }) => {
			if (result.type === 'success') {
				usernameModal = false
				toaster.show('Sucessfully changed username')
			}
		}}
	>
		<Form.TextField field="username" label="New Username" />

		{#snippet footer()}
			<Form.Submit> Save </Form.Submit>
			<Form.Response />
		{/snippet}
	</Form.Root>
</Modal>

<Modal bind:open={emailModal}>
	<Form.Root
		style="grid"
		action="?/change-email"
		form={data.changeEmailForm}
		schema={changeEmailSchema}
		onResult={({ result }) => {
			if (result.type === 'success') {
				emailModal = false
				toaster.show('Sucessfully changed email', 'Make sure to verify to regain access to all of Webstek')
			}
		}}
	>
		<Form.TextField field="email" label="New Email" />
		<Form.TextField type="password" field="password" label="Password" />

		{#snippet footer()}
			<Form.Submit> Save </Form.Submit>
			<Form.Response />
		{/snippet}
	</Form.Root>
</Modal>

<Modal bind:open={passwordModal}>
	<Form.Root
		style="grid"
		action="?/change-password"
		form={data.changePasswordForm}
		schema={changePasswordSchema}
		onResult={({ result }) => {
			if (result.type === 'success') passwordModal = false;
			toaster.show('Sucessfully changed username')
		}}
	>
		<Form.TextField type="password" field="oldPassword" label="Old Password" />
		<Form.TextField type="password" field="newPassword" label="New Password" />

		{#snippet footer()}
			<Form.Submit> Save </Form.Submit>
			<Form.Response />
		{/snippet}
	</Form.Root>
</Modal>

<Modal bind:open={deleteAccountModal}>
	<div id="delete-account">
		{#await getCollateralDamage()}
			<span> loading... </span>
		{:then data}
			<h2> Woah there cowboy! </h2>
			<p> You are about to delete your entire account. This action cannot be undone.
				{#if data.length > 0}
					Along with your personal data, the following will also be deleted: 
				{/if}
			</p>

			{#each data as { title, collateral }}
				<h3> {title} </h3>
				<ul>
					{#each collateral as item}
						<li> {item} </li>
					{/each}
				</ul>
			{/each}

			<div class="row">
				<Button style="outline" onclick={() => deleteAccountModal = false}> Cancel </Button>
				<Button type="submit" onclick={handleDeleteAccount}> Delete Everything </Button>
			</div>
		{/await}
	</div>
</Modal>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	$dot-size: 1rem;

	h1, h2, h3 {
		color: var(--foreground);
	}

	.muted {
		color: var(--muted);
	}

	.wrapper {
		display: flex;
		flex-flow: column nowrap;
		gap: 4.5rem;

		height: 100%;

		section {
			display: flex;
			flex-flow: column nowrap;
			gap: 2rem;

			width: 100%;
			
			h2 {
				display: flex;
				align-items: baseline;

				&::after {
					content: '';
					
					flex: 1;
					margin-left: 0.5rem;
					border-bottom: 1px solid var(--foreground);
				}
			}
		
			.table {
				display: grid;
				grid-template: "left middle right" auto / max-content auto max-content;
				place-items: center start;
				column-gap: 3rem;
				row-gap: 0.5rem;

				color: var(--foreground);
			
				.cell {
					font-size: $l-font;
				}

				.row {
					display: flex;
					align-items: center;
					gap: 0.25rem;

					:global(.lucide) {
						width: $dot-size;
						height: $dot-size;
					}
				}

				.verified {
					margin-left: 1rem;
					font-size: $s-font;
				
					&.success {
						color: var(--success);
					}
				
					&.failure {
						color: var(--failure);
					}
				}
			}

			.setting {
				display: grid;
				grid-template: "left right" auto / minmax(auto, 30rem) auto;
				place-items: center start;
				column-gap: 3rem;
				width: 100%;

				h3 {
					grid-column: left;
					color: var(--foreground);
				}

				p {
					grid-column: left;
				}

				:global(.button), :global(.checkbox) {
					grid-column: right;
					grid-row: 1 / span 2;
					justify-self: end;
				}
			}
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