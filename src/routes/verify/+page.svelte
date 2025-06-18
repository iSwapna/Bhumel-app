<script lang="ts">
	import { onMount } from 'svelte';
	import { verify } from '$lib/services/certify';

	interface VerificationResult {
		certificate: {
			hash: string;
			id: string;
		};
		algorithm: string;
		lastAudited: string;
	}

	let loading = false;
	let error: string | null = null;
	let verificationResult: VerificationResult | null = null;
	let username: string | null = null;
	let hash: string | null = null;
	let timestamp: number | null = null;

	async function performVerification() {
		if (!timestamp) {
			error = 'Invalid verification link';
			return;
		}

		loading = true;
		error = null;
		verificationResult = null;

		try {
			const result = await verify(timestamp);
			if (result) {
				verificationResult = result;
			} else {
				error = 'Verification failed: Summary not found on blockchain';
			}
		} catch (err) {
			console.error('Error verifying summary:', err);
			error = err instanceof Error ? err.message : 'Failed to verify summary';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		username = urlParams.get('username');
		hash = urlParams.get('hash');
		const timestampParam = urlParams.get('timestamp');

		console.log('URL parameters:', {
			username,
			hash,
			timestampParam,
			rawUsername: urlParams.get('username'),
			allParams: Object.fromEntries(urlParams.entries())
		});

		if (!username || !hash || !timestampParam) {
			error = 'Invalid verification link - missing required parameters';
			return;
		}

		const parsedTimestamp = parseInt(timestampParam, 10);
		if (isNaN(parsedTimestamp)) {
			error = 'Invalid verification link - invalid timestamp';
			return;
		}

		timestamp = parsedTimestamp;

		// Automatically perform verification when page loads
		performVerification();
	});
</script>

<div class="verify-page">
	<div class="verify-header">
		<h1>Verify Summary</h1>
		<p>Verifying the authenticity of a recorded summary</p>
	</div>

	<div class="verify-content">
		<div class="card">
			{#if loading}
				<div class="loading-message">
					<h3>Verifying...</h3>
					<p>Checking the blockchain for verification data...</p>
				</div>
			{:else if error}
				<div class="error-message">
					<h3>Verification Failed</h3>
					<p>{error}</p>
				</div>
			{:else if verificationResult}
				<div class="success-message">
					<h3>Verification Successful!</h3>
					<p>
						Summary was recorded by: <strong>{username}</strong>
					</p>
					<p>
						User ID: <strong>{verificationResult.certificate.id}</strong>
					</p>
					<p>
						Hash: <span class="hash">{verificationResult.certificate.hash}</span>
					</p>
					<p>
						Timestamp: {new Date(timestamp!).toLocaleString()}
					</p>
					<p>
						Algorithm: <a
							href={verificationResult.algorithm}
							target="_blank"
							rel="noopener noreferrer">{verificationResult.algorithm}</a
						>
					</p>
					<p>
						Last Audited: {verificationResult.lastAudited}
					</p>
					<p class="verification-note">
						✅ This summary has been verified on the Stellar blockchain and is authentic.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.verify-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--background, #f8f9fc);
	}

	.verify-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.verify-header h1 {
		font-size: 2.5rem;
		color: var(--secondary, #33001a);
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.verify-header p {
		font-size: 1.2rem;
		color: var(--secondary, #33001a);
		opacity: 0.8;
	}

	.verify-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.card {
		background: white;
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.error-message {
		color: #dc3545;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background-color: #f8d7da;
		border-radius: 4px;
	}

	.loading-message {
		text-align: center;
		padding: 2rem;
		color: var(--secondary, #33001a);
	}

	.loading-message h3 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.loading-message p {
		color: var(--lightText, #666666);
		font-size: 1.1rem;
	}

	.success-message {
		color: #28a745;
		margin-bottom: 1rem;
		padding: 1rem;
		background-color: #d4edda;
		border-radius: 4px;
	}

	.success-message h3 {
		margin-bottom: 1rem;
		font-size: 1.5rem;
	}

	.success-message p {
		margin: 0.5rem 0;
	}

	.success-message .hash {
		font-family: monospace;
		word-break: break-all;
		font-size: 0.9rem;
		background-color: #e9ecef;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.verification-note {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #c3e6cb;
		border-radius: 4px;
		font-weight: 500;
	}
</style>
