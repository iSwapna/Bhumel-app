<script lang="ts">
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();
	const modalStore = getModalStore();

	import { error } from '@sveltejs/kit';
	import { account, send, getContractId, fundContract } from '$lib/passkeyClient';
	import { keyId } from '$lib/stores/keyId';
	import { contractId } from '$lib/stores/contractId';
	import GitHubAppInstall from './GitHubAppInstall.svelte';

	let userName: string = '';
	let isLoggingIn: boolean = false;
	let isSigningUp: boolean = false;

	async function signup() {
		if (isSigningUp) {
			console.log('[Signup] Signup already in progress');
			return;
		}

		isSigningUp = true;
		console.log('signing up');
		try {
			await new Promise<string>((resolve) => {
				const modal: ModalSettings = {
					type: 'prompt',
					title: 'Enter Name',
					body: 'Please provide a username below.',
					valueAttr: { type: 'text', required: true },
					response: (r: string) => resolve(r)
				};
				modalStore.trigger(modal);
			}).then((r: string) => (userName = r));

			const {
				keyIdBase64,
				contractId: cid,
				signedTx
			} = await account.createWallet('Welcome to The LAB', userName);
			keyId.set(keyIdBase64);
			contractId.set(cid);

			if (!signedTx) {
				error(500, {
					message: 'built transaction missing'
				});
			}
			await send(signedTx);
			await fundContract($contractId);

			toastStore.trigger({
				message: 'Successfully signed up and logged in',
				background: 'variant-filled-success'
			});
		} catch (err) {
			console.log(err);
			toastStore.trigger({
				message: 'Something went wrong signing up. Please try again later.',
				background: 'variant-filled-error'
			});
		} finally {
			isSigningUp = false;
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
		console.log('logging in');
		try {
			const { keyIdBase64, contractId: cid } = await account.connectWallet({
				getContractId
			});

			keyId.set(keyIdBase64);
			console.log($keyId);

			contractId.set(cid);
			console.log($contractId);

			toastStore.trigger({
				message: 'Successfully logged in',
				background: 'variant-filled-success'
			});
		} catch (err) {
			console.log(err);
			toastStore.trigger({
				message: 'Something went wrong logging in. Please try again later.',
				background: 'variant-filled-error'
			});
		} finally {
			isLoggingIn = false;
		}
	}

	async function logout() {
		try {
			keyId.reset();
			contractId.reset();
			window.location.reload();
		} catch (err) {
			console.log(err);
			toastStore.trigger({
				message: 'Something went wrong logging out. Please try again later.',
				background: 'variant-filled-error'
			});
		}
	}
</script>

<div class="user-section">
	{#if $keyId}
		<div class="user-info">
			<span class="user-name">User</span>
			<GitHubAppInstall />
			<button class="sign-out-btn" on:click={logout}>Logout</button>
		</div>
	{:else}
		<div class="auth-buttons">
			<button class="sign-in-btn" on:click={login} disabled={isLoggingIn}>
				{#if isLoggingIn}
					Logging in...
				{:else}
					Sign In
				{/if}
			</button>
			<button class="sign-up-btn" on:click={signup} disabled={isSigningUp}>
				{#if isSigningUp}
					Signing up...
				{:else}
					Sign Up
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
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

	@media (max-width: 768px) {
		.user-section {
			margin-left: 0;
			width: 100%;
			display: flex;
			justify-content: center;
			margin-top: 0.5rem;
		}
	}
</style>
