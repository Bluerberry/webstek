
<script lang="ts">

	import Button from '$components/Button.svelte'

    import type { Snippet } from 'svelte'

	type Props = { children: Snippet }
	let { children }: Props = $props()

</script>

<div class="wrapper">
	<header>
		<h1> Admin Panel </h1>
		<div class="row">
			<Button style="link" href="/admin/users">
				Users
			</Button>
		</div>
	</header>
	
	{@render children()}
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;

	$dot-size: 1rem;

	h1 {
		color: var(--foreground);
	}
	
	.wrapper {
		display: flex;
		flex-flow: column nowrap;
		gap: 4.5rem;

		width: 100%;
		height: 100%;
		max-width: 650px;

		header {
			display: flex;
			align-items: center;

			h1 {
				flex: 1;
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
		}
	}

</style>