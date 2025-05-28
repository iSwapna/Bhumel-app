<script lang="ts">
	import { getModalStore, getToastStore, type ModalSettings } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();
	const modalStore = getModalStore();

	import { error } from '@sveltejs/kit';
	import { account, send, native, fundContract } from '$lib/passkeyClient';
	import { keyId } from '$lib/stores/keyId';
	import { contractId } from '$lib/stores/contractId';
	import { onMount } from 'svelte';

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
			console.log('[Signup] Prompting for username');
			await new Promise<string>((resolve) => {
				const modal: ModalSettings = {
					type: 'prompt',
					title: 'Enter Name',
					body: 'Please provide a username below.',
					valueAttr: { type: 'text', required: true },
					response: (r: string) => resolve(r)
				};
				modalStore.trigger(modal);
			}).then((r: string) => {
				userName = r;
				console.log('[Signup] Username received:', userName);
			});

			console.log('[Signup] Creating wallet with name:', userName);
			const {
				keyIdBase64,
				contractId: cid,
				signedTx
			} = await account.createWallet('Bhumel', userName);
			console.log('[Signup] Wallet created successfully');
			console.log('[Signup] KeyId:', keyIdBase64);
			console.log('[Signup] ContractId:', cid);

			keyId.set(keyIdBase64);
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
