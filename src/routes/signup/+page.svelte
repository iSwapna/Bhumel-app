<script lang="ts">
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();
	const modalStore = getModalStore();

	import { error } from '@sveltejs/kit';
	import { account, send, native, fundContract } from '$lib/passkeyClient';
	import { keyId } from '$lib/stores/keyId';
	import { contractId } from '$lib/stores/contractId';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let userName: string = '';

	async function getBalance() {
		console.log('[Balance] Fetching balance for contract:', $contractId);
		try {
			const { result } = await native.balance({ id: $contractId });
			console.log('[Balance] Balance retrieved:', result.toString());
		} catch (err) {
			console.error('[Balance] Error fetching balance:', err);
			toastStore.trigger({
				message: 'Something went wrong checking your balance. Please try again later.',
				background: 'variant-filled-error'
			});
		}
	}

	async function signup() {
		console.log('[Signup] Starting signup process');
		try {
			console.log('[Signup] Initial userName value:', userName);
			console.log('[Signup] Prompting for username');
			userName = await new Promise<string>((resolve) => {
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

				keyId.set(keyIdBase64);
				console.log('[Signup] KeyId after setting store:', get(keyId));
				contractId.set(cid);

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

				console.log('[Signup] Getting initial balance');
				await getBalance();
				console.log('[Signup] Signup process completed successfully');
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
		}
	}

	onMount(() => {
		signup();
	});
</script>

<div>
	<p>Signing up...</p>
</div>
