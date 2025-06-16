<script lang="ts">
	import { browser } from '$app/environment';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { installationIdStore } from '$lib/stores/githubStore';

	const toastStore = getToastStore();

	let installationStatus = 'not_installed';
	let installationMessage = '';
	let installationId = $installationIdStore;

	// Listen for messages from the installation popup
	function handlePostMessage(event: MessageEvent) {
		if (event.data.type === 'github-app-installation') {
			installationStatus = event.data.success ? 'installed' : 'failed';
			installationMessage = event.data.success ? 'Successfully installed!' : 'Installation failed';
			installationId = event.data.installationId;
			installationIdStore.set(installationId);
			toastStore.trigger({
				message: installationMessage,
				background:
					installationStatus === 'installed' ? 'variant-filled-success' : 'variant-filled-error'
			});
		}
	}

	onMount(() => {
		window.addEventListener('message', handlePostMessage);
		return () => {
			window.removeEventListener('message', handlePostMessage);
		};
	});

	async function handleInstall() {
		try {
			// Generate a unique state for this installation
			let state = '';
			if (browser) {
				const array = new Uint8Array(32);
				crypto.getRandomValues(array);
				state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
			}

			const response = await fetch(`/api/github/install-url?state=${state}`);
			if (!response.ok) throw new Error('Failed to get installation URL');
			const { installationUrl } = await response.json();

			// Open the installation popup
			const popup = window.open(installationUrl, 'github-app-installation', 'width=800,height=600');

			if (!popup) {
				throw new Error('Popup blocked. Please allow popups for this site.');
			}
		} catch (error) {
			console.error('Installation error:', error);
			toastStore.trigger({
				message: error instanceof Error ? error.message : 'Failed to start installation',
				background: 'variant-filled-error'
			});
		}
	}
</script>

<div class="github-app-install">
	<button class="connect-apps-btn" on:click={handleInstall}>
		{#if installationStatus === 'installed'}
			Reconnect Apps
		{:else}
			Connect Apps
		{/if}
	</button>
	{#if installationId}
		<div class="installation-id">
			Installation ID: {installationId}
		</div>
	{/if}
</div>

<style>
	.github-app-install {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.connect-apps-btn {
		background-color: #2ea44f;
		border: 1px solid rgba(27, 31, 35, 0.15);
		border-radius: 6px;
		color: #fff;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
		padding: 5px 16px;
		transition: background-color 0.2s;
	}

	.connect-apps-btn:hover:not(:disabled) {
		background-color: #2c974b;
	}

	.connect-apps-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.installation-id {
		font-size: 0.875rem;
		color: #57606a;
	}
</style>
