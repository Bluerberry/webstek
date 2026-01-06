
<script lang="ts">
	
	import * as Form from '$components/form'
	import Modal from '$components/Modal.svelte'
	import Button from '$components/Button.svelte'
	import { Dot } from '@lucide/svelte'
	
	import { getSessions, endSession } from './sessions.remote.js'
    import { changeEmailSchema, changePasswordSchema, changeUsernameSchema } from '$validation/authSchemas.js';

	let { data } = $props()
	let usernameModal = $state(false)
	let emailModal = $state(false)
	let passwordModal = $state(false)

	function toggleModal(modal: string) {
		usernameModal = modal === 'username'
		emailModal = modal === 'email'
		passwordModal = modal === 'password'
	}

	async function handleEndSession(sessionId: string) {
		try {
			await endSession(sessionId).updates(
				getSessions(data.user.id).withOverride(current => {
					return current.filter(session => session.id !== sessionId)
				})
			)
		} catch {
			// ...
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
			<Button style="link" onclick={() => toggleModal('username')}> Change </Button>

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
				<Button style="link" onclick={() => toggleModal('email')}> Change </Button>
				{#if !data.user.verified}
					<Dot />
					<Button style='link'> Verify </Button>
				{/if}
			</div>

			<!-- PASSWORD -->
			<span class="label"> Password </span>
			<span class="cell"> ●●●●●●●● </span>

			<div class="row">
				<Button style="link" onclick={() => toggleModal('password')}> Change </Button>
				<Dot />
				<Button style="link" disabled={!data.user.verified}> Recover </Button>
			</div>
		</div>
	</section>

	<div class="divider"></div>

	<section>
		<h2> Sessions </h2>
		<div class="table">
			<span class="label"> Metadata </span>
			<span class="label" style="grid-column: span 2"> Last Activity </span>

			{#each await getSessions(data.user.id) as session}
				<span class="cell">
					{#if session.country} {session.country}, {/if}
					{session.browserName}
					{session.browserVersion}
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
</div>

<Modal bind:open={usernameModal}>
	<Form.Root
		style="grid"
		action="?/change-username"
		form={data.changeUsernameForm}
		schema={changeUsernameSchema}
		onResult={({ result }) => {
			if (result.type === 'success')  usernameModal = false;
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
			if (result.type === 'success') emailModal = false;
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
			if (result.type === 'success')  passwordModal = false;
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

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

	$dot-size: 1rem;

	.wrapper {
		display: flex;
		flex-flow: column nowrap;
		align-items: center;
		gap: 3rem;

		height: 100%;

		.divider {
			width: 80%;
			border-bottom: 1px solid var(--muted);
		}

		section {
			width: 100%;
			
			h1, h2 {
				margin-bottom: 0.75rem;
				color: var(--foreground);
			}
		
			.table {
				display: grid;
				grid-template: "left middle right" auto / max-content auto max-content;
				place-items: center start;
				column-gap: 3rem;
				row-gap: 0.5rem;

				color: var(--foreground);
			
				.label {
					font-size: $m-font;
				}
			
				.cell {
					font-size: $l-font;
				}
			
				.muted {
					color: var(--muted);
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
		}
	}
	
</style>