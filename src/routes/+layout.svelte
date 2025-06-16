<script lang="ts">
	import { page } from '$app/stores';
	import '../app.postcss';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';

	// Initialize stores first
	import {
		initializeStores,
		Toast,
		Modal,
		getModalStore,
		getToastStore,
		type ModalSettings
	} from '@skeletonlabs/skeleton';
	initializeStores();
	const toastStore = getToastStore();
	const modalStore = getModalStore();

	import { error } from '@sveltejs/kit';
	import { account, send, native, fundContract, getContractId } from '$lib/passkeyClient';
	import { keyId } from '$lib/stores/keyId';
	import { contractId } from '$lib/stores/contractId';
	import { get } from 'svelte/store';

	import GitHubAppInstall from '$lib/components/GitHubAppInstall.svelte';

	let userName = '';
	let isLoggedIn = false;
	let isSigningUp = false;
	let isLoggingIn = false; // Add flag for login in progress

	// Check login state on mount
	onMount(() => {
		if (browser) {
			const storedKeyId = localStorage.getItem('yog:keyId');
			if (storedKeyId) {
				console.log('[Auth] Found stored keyId, restoring session');
				keyId.set(storedKeyId);
				isLoggedIn = true;
			}
		}
	});

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

	// Handle navigation prevention during login
	let beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

	$: if (browser && isLoggingIn) {
		// Set up beforeunload handler
		beforeUnloadHandler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
			return '';
		};
		window.addEventListener('beforeunload', beforeUnloadHandler);
	}

	// Clean up event listeners
	onDestroy(() => {
		if (beforeUnloadHandler) {
			window.removeEventListener('beforeunload', beforeUnloadHandler);
		}
	});

	async function getBalance() {
		if (!$contractId) {
			throw new Error('No contract ID available');
		}

		console.log('[Balance] Fetching balance for contract:', $contractId);
		try {
			const { result } = await native.balance({ id: $contractId });
			console.log('[Balance] Balance received:', result.toString());
			return result.toString();
		} catch (error) {
			console.error('[Balance] Error fetching balance:', error);
			toastStore.trigger({
				message: 'Something went wrong checking your balance. Please try again later.',
				background: 'variant-filled-error'
			});
			throw error;
		}
	}

	async function login() {
		if (isLoggingIn) {
			console.log('[Login] Login already in progress');
			toastStore.trigger({
				message: 'Please wait for the current login to complete',
				background: 'variant-filled-warning'
			});
			return;
		}

		isLoggingIn = true;
		try {
			console.log('[Login] Starting login process');
			const { keyIdBase64, contractId: newContractId } = await account.connectWallet({
				rpId: window.location.hostname,
				getContractId
			});

			if (!keyIdBase64) {
				throw new Error('Failed to get keyId from wallet connection');
			}

			console.log('[Login] KeyId received:', keyIdBase64);
			keyId.set(keyIdBase64);
			localStorage.setItem('yog:keyId', keyIdBase64);

			// Set contract ID if available
			if (newContractId) {
				console.log('[Login] ContractId received:', newContractId);
				contractId.set(newContractId);

				// Only attempt balance check if we have a contract ID
				try {
					const balance = await getBalance();
					console.log('[Login] Initial balance:', balance);
				} catch (balanceError) {
					console.error('[Login] Error getting initial balance:', balanceError);
					// Don't throw here, as we're still logged in even if balance check fails
				}
			} else {
				console.log('[Login] No contract ID received from wallet connection');
				// Clear any existing contract ID
				contractId.set('');
			}

			isLoggedIn = true;
			toastStore.trigger({
				message: 'Successfully logged in',
				background: 'variant-filled-success'
			});
		} catch (error) {
			console.error('[Login] Error:', error);
			toastStore.trigger({
				message: error instanceof Error ? error.message : 'Failed to log in',
				background: 'variant-filled-error'
			});
		} finally {
			isLoggingIn = false;
		}
	}

	async function logout() {
		console.log('[Logout] Starting logout process');
		try {
			// Remove event listeners first
			if (beforeUnloadHandler) {
				window.removeEventListener('beforeunload', beforeUnloadHandler);
				beforeUnloadHandler = null;
			}

			// Clear the stores
			keyId.reset();
			contractId.set('');
			localStorage.removeItem('yog:keyId');

			// Reload the page to clear any cached state
			window.location.reload();
		} catch (err) {
			console.error('[Logout] Error during logout:', err);
			toastStore.trigger({
				message: 'Something went wrong logging out. Please try again later.',
				background: 'variant-filled-error'
			});
		}
	}

	async function signup() {
		if (isSigningUp) {
			console.log('[Signup] Signup already in progress');
			return;
		}

		isSigningUp = true;
		console.log('[Signup] Starting signup process');
		try {
			console.log('[Signup] Initial userName value:', userName);
			console.log('[Signup] Prompting for username');
			userName = await new Promise((resolve: (value: string) => void) => {
				const modal: ModalSettings = {
					type: 'prompt',
					title: 'Enter Name',
					body: 'Please provide a username below.',
					valueAttr: { type: 'text', required: true },
					response: (r: string) => {
						console.log('[Signup] Modal response received:', r);
						// Trim whitespace and ensure non-empty
						const trimmedName = r.trim();
						if (!trimmedName) {
							toastStore.trigger({
								message: 'Username cannot be empty',
								background: 'variant-filled-error'
							});
							return;
						}
						resolve(trimmedName);
					}
				};
				modalStore.trigger(modal);
			});
			console.log('[Signup] Username received and set:', userName);
			console.log('[Signup] Username type:', typeof userName);
			console.log('[Signup] Username length:', userName.length);

			if (!userName) {
				throw new Error('Username is required');
			}

			console.log('[Signup] Creating wallet with name:', userName);
			try {
				const {
					keyIdBase64,
					contractId: cid,
					signedTx
				} = await account.createWallet('Bhumel', userName);
				console.log('[Signup] Wallet created successfully');
				console.log('[Signup] KeyId (raw):', keyIdBase64);
				console.log('[Signup] KeyId type:', typeof keyIdBase64);
				console.log('[Signup] KeyId length:', keyIdBase64.length);
				console.log('[Signup] KeyId first 10 chars:', keyIdBase64.substring(0, 10));
				console.log(
					'[Signup] KeyId last 10 chars:',
					keyIdBase64.substring(keyIdBase64.length - 10)
				);
				console.log('[Signup] ContractId:', cid);

				if (!cid) {
					throw new Error('No contract ID received from wallet creation');
				}

				keyId.set(keyIdBase64);
				console.log('[Signup] KeyId after setting store:', get(keyId));
				contractId.set(cid);
				console.log('[Signup] ContractId set:', $contractId);

				if (!signedTx) {
					console.error('[Signup] Error: built transaction missing');
					error(500, {
						message: 'built transaction missing'
					});
				}
				console.log('[Signup] Sending transaction');
				await send(signedTx);
				console.log('[Signup] Transaction sent successfully');

				console.log('[Signup] Funding contract');
				await fundContract($contractId);
				console.log('[Signup] Contract funded successfully');

				// Wait a moment for the contract to be ready
				await new Promise((resolve) => setTimeout(resolve, 2000));

				console.log('[Signup] Getting initial balance');
				await getBalance();
				console.log('[Signup] Signup process completed successfully');

				// Set logged in state after everything is complete
				isLoggedIn = true;
				toastStore.trigger({
					message: 'Successfully signed up and logged in',
					background: 'variant-filled-success'
				});
			} catch (err) {
				console.error('[Signup] Error during wallet creation:', err);
				console.error('[Signup] Error details:', {
					error: err,
					errorName: err instanceof Error ? err.name : 'Unknown',
					errorMessage: err instanceof Error ? err.message : String(err),
					errorStack: err instanceof Error ? err.stack : undefined
				});
				throw err;
			}
		} catch (err) {
			console.error('[Signup] Error during signup:', err);
			toastStore.trigger({
				message: 'Something went wrong signing up. Please try again later.',
				background: 'variant-filled-error'
			});
		} finally {
			isSigningUp = false;
		}
	}

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
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

			<div class="user-section">
				{#if isLoggedIn}
					<div class="user-info">
						<span class="user-name">{$page.data.session?.user?.name || 'User'}</span>
						<GitHubAppInstall />
						<button class="sign-out-btn" onclick={logout}>Logout</button>
					</div>
				{:else}
					<div class="auth-buttons">
						<button class="sign-in-btn" onclick={login} disabled={isLoggingIn}>
							{#if isLoggingIn}
								Logging in...
							{:else}
								Sign In
							{/if}
						</button>
						<button class="sign-up-btn" onclick={signup} disabled={isSigningUp}>
							{#if isSigningUp}
								Signing up...
							{:else}
								Sign Up
							{/if}
						</button>
					</div>
				{/if}
			</div>
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

	.user-section {
		margin-left: auto;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-name {
		font-weight: 700;
		color: #33001a;
		font-family: 'Roboto', sans-serif;
	}

	.sign-in-btn,
	.sign-out-btn,
	.sign-up-btn {
		padding: 0.6rem 1.5rem;
		border-radius: 4px;
		font-weight: 700;
		transition: all 0.2s;
		border: none;
		font-size: 0.95rem;
		cursor: pointer;
		font-family: 'Roboto', sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.sign-in-btn {
		background-color: #800020;
		color: white;
	}

	.sign-up-btn {
		background-color: #33001a;
		color: white;
	}

	.sign-out-btn {
		color: #33001a;
		border: 2px solid #800020;
		background-color: transparent;
	}

	.sign-in-btn:hover:not(:disabled),
	.sign-up-btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.sign-in-btn:hover:not(:disabled) {
		background-color: #600018;
	}

	.sign-up-btn:hover:not(:disabled) {
		background-color: #1a000d;
	}

	.sign-out-btn:hover {
		background-color: rgba(128, 0, 32, 0.05);
		transform: translateY(-1px);
	}

	.sign-in-btn:disabled,
	.sign-up-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.auth-buttons {
		display: flex;
		gap: 1rem;
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

		.user-section {
			margin-left: 0;
			width: 100%;
			display: flex;
			justify-content: center;
			margin-top: 0.5rem;
		}

		.nav-tab {
			font-size: 1rem;
			padding: 0.5rem 0;
		}
	}
</style>
