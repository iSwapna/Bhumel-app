<script lang="ts">
	import { onMount } from 'svelte';
	import { verify } from '$lib/services/certify';

	let summary = '';
	let loading = false;
	let error: string | null = null;
	let verificationResult: { timestamp: number } | null = null;
	let userId: string | null = null;
	let hash: string | null = null;

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		userId = urlParams.get('userId');
		hash = urlParams.get('hash');

		if (!userId || !hash) {
			error = 'Invalid verification link';
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		summary = formData.get('summary-text') as string;

		if (!summary) {
			error = 'Please enter the summary text';
			return;
		}

		if (!userId || !hash) {
			error = 'Invalid verification link';
			return;
		}

		loading = true;
		error = null;
		verificationResult = null;

		try {
			const timestamp = await verify(hash, userId, Date.now());
			if (timestamp) {
				verificationResult = { timestamp };
			} else {
				error = 'Verification failed: Summary not found';
			}
		} catch (err) {
			console.error('Error verifying summary:', err);
			error = err instanceof Error ? err.message : 'Failed to verify summary';
		} finally {
			loading = false;
		}
	}
</script>

<div class="verify-page">
	<div class="verify-header">
		<h1>Verify Summary</h1>
		<p>Enter the summary text to verify its authenticity</p>
	</div>

	<div class="verify-content">
		<div class="card">
			<form on:submit={handleSubmit}>
				<textarea
					class="input-field"
					rows="6"
					id="summary-text"
					name="summary-text"
					placeholder="Paste the summary text here..."
				></textarea>

				{#if error}
					<div class="error-message">{error}</div>
				{/if}

				{#if verificationResult}
					<div class="success-message">
						<h3>Verification Successful!</h3>
						<p>
							Summary was recorded on: {new Date(verificationResult.timestamp).toLocaleString()}
						</p>
					</div>
				{/if}

				<button type="submit" class="button primary" disabled={loading}>
					{#if loading}
						Verifying...
					{:else}
						Verify
					{/if}
				</button>
			</form>
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

	.input-field {
		width: 100%;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		margin-bottom: 1rem;
		resize: vertical;
	}

	.error-message {
		color: #dc3545;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background-color: #f8d7da;
		border-radius: 4px;
	}

	.success-message {
		color: #28a745;
		margin-bottom: 1rem;
		padding: 1rem;
		background-color: #d4edda;
		border-radius: 4px;
	}

	.button {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.button.primary {
		background-color: var(--primary, #800020);
		color: white;
	}

	.button.primary:hover {
		background-color: var(--primary-dark, #600018);
	}

	.button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
