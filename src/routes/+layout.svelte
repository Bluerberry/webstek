
<script lang="ts">

	import '$styles/global.scss'
    import { enhance } from '$app/forms'
	import theme from '$stores/theme.svelte'

	import Button from '$components/Button.svelte'
	import { Navigation } from '$components/navigation'

	let { data, children } = $props()

	const navtree = [
		{ label: 'Home', path: '/' },
		{ label: 'About', path: '/about' },
		{ label: 'Projects', children: [
			{ label: 'Fuck Spotify', path: '/projects/fuck-spotify' },
			{ label: 'Why am I poor?', path: '/projects/why-am-i-poor' }
		]},
		{ label: 'Admin Panel', path: '/admin' },
	]

</script>

<div class="layout theme-{theme.invert()}">
	<div class="gutter">
		{@render account()}
		<Navigation {navtree} />
	</div>
	<main class="theme-{theme.value}">
		{@render children()}
	</main>
</div>

{#snippet account()}
	<div class="account">
		{#if data.user}
			<h3>Welcome {data.user.username}</h3>
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

	$layout-padding: 4rem 6rem;

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
				margin-left: 2*$icon-padding + $icon-size;
				margin-bottom: 2rem;

				h3 {
					margin-bottom: 0.5rem;
					color: var(--foreground);
				}

				form {
					display: inline-block;
				}
			}
		}

		main {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: center;

			width: 65%;
			padding: $layout-padding;
			background: var(--background);
		}
	}

</style>