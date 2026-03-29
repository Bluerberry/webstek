
<script lang="ts">

	import '$styles/global.scss'

    import { untrack } from 'svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import theme from '$stores/theme.svelte'
	import toaster from '$stores/toaster.svelte.js'
	import { logout } from './auth/logout/logout.remote'
	import { createFlow, withFlow } from '$scripts/flow.js'
	
	import { Toaster } from '$components/toaster'
	import Button from '$components/Button.svelte'
	import { Navigation } from '$components/navigation'

	let { data, children } = $props()

	const navtree = [
		{ label: 'Home', path: '/' },
		{ label: 'About', path: '/about' },
		{ label: 'Projects', children: [
			{ label: 'Fuck Spotify', path: '/projects/fuck-spotify' },
			{ label: 'Underworld Cookbook', path: '/projects/underworld-cookbook' },
			{ label: 'Why am I poor?', path: '/projects/why-am-i-poor' }
		]},
		{ label: 'Admin Panel', adminOnly: true, children: [
			{ label: 'Data Analytics', path: '/admin/analytics' },
			{ label: 'Users', path: '/admin/users'}
		]},
	]

	const destination = $derived(
		page.url.pathname.startsWith('/auth') ? '/' : page.url.pathname
	)

	$effect(() => {
		for (const flash of data.flash) {
			untrack(
				() => toaster.show(flash.title, flash.body, flash.duration)
			)
		}
	})

</script>

<div class="layout theme-{theme.invert()}">
	<div class="gutter">
		<div class="account">
			{#if data.user}
				<h3> Welcome, {data.user.username} </h3>
				<Button href="/account">
					Account
				</Button>
				<Button 
					style="outline" 
					onclick={async () => {
						await logout();
						goto('/', { invalidateAll: true })
					}}
				>
					Logout
				</Button>
			{:else}
				<h3>Welcome stranger</h3>
				<Button href={withFlow('/auth/register', createFlow('register', destination))}>
					Register
				</Button>
				<Button href={withFlow('/auth/login', createFlow('login', destination))} style="outline">
					Login
				</Button>
			{/if}
		</div>

		<Navigation {navtree} />
	</div>

	<main class="theme-{theme.value}">
		<Toaster />
		
		{@render children()}
	</main>
</div>

<style lang="scss">

	@use '$styles/variables' as *;
	@use '$styles/themes' as *;
	@include themed();

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