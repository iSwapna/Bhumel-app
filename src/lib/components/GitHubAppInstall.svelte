<script lang="ts">
	import { browser } from '$app/environment';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	const toastStore = getToastStore();

	let isInstalling = false;

	// Generate a shorter state value
	function generateState() {
		return Math.random().toString(36).substring(2, 8);
	}

	// Listen for installation messages
	function handleMessage(event: MessageEvent) {
		if (event.data?.type === 'github-app-installation') {
			console.log('Installation message received:', event.data);
			isInstalling = false;

			if (event.data.installationId) {
				toastStore.trigger({
					message: 'GitHub App installed successfully!',
					background: 'variant-filled-success'
				});
			} else {
				toastStore.trigger({
					message: 'GitHub App installation failed',
					background: 'variant-filled-error'
				});
			}
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('message', handleMessage);
			return () => window.removeEventListener('message', handleMessage);
		}
	});

	async function handleInstall() {
		if (isInstalling) return;
		isInstalling = true;

		try {
			// Generate a new state value
			const state = generateState();

			// Store in sessionStorage instead of localStorage
			if (browser) {
				sessionStorage.setItem('github_install_state', state);
			}

			// Get installation URL from server
			const response = await fetch(`/api/github/install-url?state=${state}`);
			if (!response.ok) {
				throw new Error('Failed to get installation URL');
			}
			const { installationUrl } = await response.json();

			// Open the installation URL in a new window
			window.open(installationUrl, '_blank', 'width=800,height=600');
		} catch (error) {
			console.error('Error initiating GitHub app installation:', error);
			toastStore.trigger({
				message: 'Failed to start GitHub app installation',
				background: 'variant-filled-error'
			});
			isInstalling = false;
		}
	}
</script>

<button class="connect-apps-btn" onclick={handleInstall} disabled={isInstalling}>
	{#if isInstalling}
		Connecting...
	{:else}
		Connect Apps
	{/if}
</button>

<style>
	.connect-apps-btn {
		background-color: #2ea44f;
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0.6rem 1.5rem;
		font-weight: 700;
		transition: all 0.2s;
		font-size: 0.95rem;
		cursor: pointer;
		font-family: 'Roboto', sans-serif;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.connect-apps-btn:hover:not(:disabled) {
		background-color: #2c974b;
		transform: translateY(-1px);
	}

	.connect-apps-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
