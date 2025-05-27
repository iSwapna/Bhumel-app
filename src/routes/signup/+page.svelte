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
		console.log('fetching balances');
		try {
			const { result } = await native.balance({ id: $contractId });
			console.log('Balance:', result.toString());
		} catch (err) {
			console.log(err);
			toastStore.trigger({
				message: 'Something went wrong checking your balance. Please try again later.',
				background: 'variant-filled-error'
			});
		}
	}

	async function signup() {
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
			} = await account.createWallet('Bhumel', userName);
			keyId.set(keyIdBase64);
			contractId.set(cid);

			if (!signedTx) {
				error(500, {
					message: 'built transaction missing'
				});
			}
			await send(signedTx);
			await fundContract($contractId);
			getBalance();
		} catch (err) {
			console.log(err);
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
