<script lang="ts">
	import { browser } from '$app/environment';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	const toastStore = getToastStore();

	let isInstalling = false;
	let installationStatus: 'idle' | 'success' | 'error' = 'idle';
	let installationMessage = '';
	let installationId: string | null = null;

	// Handle post-installation message from popup
	function handlePostMessage(event: MessageEvent) {
		if (event.data?.type === 'github-app-installation') {
			if (event.data.status === 'success') {
				installationStatus = 'success';
				installationMessage = 'GitHub App installed successfully!';
				installationId = event.data.installationId;
				isInstalling = false;
				toastStore.trigger({
					message: installationMessage,
					background: 'variant-filled-success'
				});
			} else {
				installationStatus = 'error';
				installationMessage = 'Failed to install GitHub App. Please try again.';
				isInstalling = false;
				toastStore.trigger({
					message: installationMessage,
					background: 'variant-filled-error'
				});
			}
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('message', handlePostMessage);
			return () => window.removeEventListener('message', handlePostMessage);
		}
	});

	async function handleInstall() {
		try {
			isInstalling = true;
			installationStatus = 'idle';
			installationMessage = '';

			// Generate a random state using browser crypto
			let state = '';
			if (browser) {
				const randomBytes = new Uint8Array(6);
				crypto.getRandomValues(randomBytes);
				state = Array.from(randomBytes)
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			}

			// Get installation URL
			const response = await fetch(`/api/github/install-url?state=${state}`);
			const data = await response.json();

			if (!data.installationUrl) {
				throw new Error('Failed to get installation URL');
			}

			// Open installation popup
			const width = 800;
			const height = 600;
			const left = window.screenX + (window.outerWidth - width) / 2;
			const top = window.screenY + (window.outerHeight - height) / 2;

			window.open(
				data.installationUrl,
				'github-app-installation',
				`width=${width},height=${height},left=${left},top=${top}`
			);
		} catch (error) {
			console.error('Error starting installation:', error);
			installationStatus = 'error';
			installationMessage = error instanceof Error ? error.message : 'Failed to start installation';
			isInstalling = false;
			toastStore.trigger({
				message: installationMessage,
				background: 'variant-filled-error'
			});
		}
	}
</script>

<div class="github-app-install">
	<button class="connect-apps-btn" on:click={handleInstall} disabled={isInstalling}>
		{#if isInstalling}
			Connecting...
		{:else if installationStatus === 'success'}
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
