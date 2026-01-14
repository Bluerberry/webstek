
<script lang="ts">

	import '$styles/global.scss'
    import { enhance } from '$app/forms'
	import theme from '$stores/theme.svelte'
	
	import Button from '$components/Button.svelte'
	import { Navigation } from '$components/navigation'
    import { Toaster } from '$components/toaster'

	let { data, children } = $props()

	const navtree = [
		{ label: 'Home', path: '/' },
		{ label: 'About', path: '/about' },
		{ label: 'Projects', children: [
			{ label: 'Fuck Spotify', path: '/projects/fuck-spotify' },
			{ label: 'Underworld Cookbook', path: '/projects/underworld-cookbook' },
			{ label: 'Why am I poor?', path: '/projects/why-am-i-poor' }
		]}
	]

</script>

<div class="layout theme-{theme.invert()}">
	<div class="gutter">
		{@render account()}
		<Navigation {navtree} />
	</div>

	<main class="theme-{theme.value}">
		<Toaster />
		
		{@render children()}
	</main>
</div>

{#snippet account()}
	<div class="account">
		{#if data.user}
			<h3>Welcome, {data.user.username}</h3>
			<Button href="/account">
				Account
			</Button>
			<form method="POST" action="/auth/logout" use:enhance>
				<Button type="submit" style="outline">
					Logout
				</Button>
			</form>
		{:else}
			<h3>Welcome stranger</h3>
			<Button href="/auth/register">
				Register
			</Button>
			<Button href="/auth/login" style="outline">
				Login
			</Button>
		{/if}
	</div>
{/snippet}

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

	$layout-padding: 6rem 4rem;

	.layout {
		display: flex;
		flex-flow: row nowrap;
		justify-content: end;
		
		width: 100%;
		height: 100%;
		background: var(--background);

		.gutter {
			padding: $layout-padding;

			.account {
				display: grid;
				grid-template: "left right" auto / min-content auto;
				place-items: start;
				gap: 0.5rem;

				margin-left: 2*$icon-padding + $icon-size;
				margin-bottom: 2rem;

				h3 {
					grid-column: left / right;
					color: var(--foreground);
				}
			}
		}

		main {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: center;

			width: 75%;
			padding: $layout-padding;
			background: var(--background);
		}
	}

</style>