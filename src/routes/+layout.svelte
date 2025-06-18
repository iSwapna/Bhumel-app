<script lang="ts">
	import { page } from '$app/stores';
	import '../app.postcss';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	// Initialize stores first
	import { initializeStores, Toast, Modal, getToastStore } from '@skeletonlabs/skeleton';
	initializeStores();
	const toastStore = getToastStore();

	import { keyId } from '$lib/stores/keyId';

	let isLoggedIn = false;

	// Check login state on mount
	onMount(() => {
		if (browser) {
			// Check if keyId exists in the persisted store
			if ($keyId) {
				console.log('[Auth] Found stored keyId, restoring session');
				isLoggedIn = true;
			}
		}
	});

	// Update isLoggedIn when keyId changes
	$: isLoggedIn = !!$keyId;

	// Check if current route requires authentication
	$: if (browser) {
		const protectedRoutes = ['/discover', '/dashboard', '/share'];
		const currentPath = $page.url.pathname;
		const isProtectedRoute = protectedRoutes.some((route) => currentPath.startsWith(route));

		if (isProtectedRoute && !isLoggedIn) {
			console.log('[Auth] Redirecting from protected route:', currentPath);
			toastStore.trigger({
				message: 'Please log in to access this page',
				background: 'variant-filled-warning'
			});
			goto('/');
		}
	}

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import ConnectButtons from '$lib/components/ConnectButtons.svelte';
</script>

<Toast />
<Modal />

<div class="app">
	<header>
		<nav>
			<div class="nav-tabs">
				<a href="/" class="nav-tab">Home</a>
				<a href="/discover" class="nav-tab">Discover</a>
				<a href="/dashboard/track" class="nav-tab">Track</a>
				<a href="/share" class="nav-tab">Share</a>
			</div>

			<ConnectButtons />
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	/* Remove Google Fonts import since we're using Fontsource */

	:global(body) {
		font-family: 'Roboto', sans-serif;
		margin: 0;
		padding: 0;
		color: #33001a;
		font-weight: 500;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Roboto Slab', serif;
		color: #33001a;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background-color: white;
		box-shadow: 0 2px 8px rgba(128, 0, 32, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0.75rem 2rem;
	}

	.nav-tabs {
		display: flex;
		gap: 4rem;
		margin: 0 auto;
	}

	.nav-tab {
		color: #33001a;
		text-decoration: none;
		font-family: 'Roboto Slab', serif;
		font-weight: 700;
		font-size: 1.2rem;
		padding: 1rem 0;
		position: relative;
		transition: color 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.nav-tab:hover {
		color: #800020;
	}

	.nav-tab:after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 3px;
		background-color: #800020;
		transition: width 0.3s;
	}

	.nav-tab:hover:after {
		width: 100%;
	}

	main {
		flex: 1;
	}

	@media (max-width: 768px) {
		nav {
			flex-direction: column;
			gap: 0.5rem;
			padding: 0.5rem 1rem;
		}

		.nav-tabs {
			width: 100%;
			justify-content: center;
			gap: 1.5rem;
		}

		.nav-tab {
			font-size: 1rem;
			padding: 0.5rem 0;
		}
	}
</style>
