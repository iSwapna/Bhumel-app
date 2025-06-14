<script lang="ts">
	import { shareDataStore, errorStore } from '$lib/stores/shareStore';
	import { onMount } from 'svelte';
	import { certify, generateLink } from '$lib/services/certify';
	import { page } from '$app/stores';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	// Debug session data
	$: {
		console.log('Session data:', {
			session: $page.data.session,
			user: $page.data.session?.user,
			userId: $page.data.session?.user?.id
		});
	}

	interface Skill {
		name: string;
		evidence: string[];
	}

	interface ShareData {
		context: string;
		selectedRepo: string;
		summary: string;
		confidenceScore: number;
		isEditing: boolean;
		editedSummary: string;
		skills: Skill[];
		certificationResult?: {
			userId: string;
			hash: string;
			timestamp: number;
		};
	}

	// Initialize share data if not exists
	onMount(() => {
		if (!$shareDataStore) {
			$shareDataStore = {
				context: '',
				selectedRepo: 'algol',
				summary: '',
				confidenceScore: 0,
				isEditing: false,
				editedSummary: '',
				skills: []
			};
		}
	});

	// Get store values
	let shareData: ShareData = $shareDataStore || {
		context: '',
		selectedRepo: 'algol',
		summary: '',
		confidenceScore: 0,
		isEditing: false,
		editedSummary: '',
		skills: []
	};
	let summarizeLoading = false;
	let recordLoading = false;
	let shareLoading = false;
	let error = $errorStore;
	let installationId = '66241334'; // GitHub installation ID
	let shareSuccess = false;

	// Update store values when local variables change
	$: {
		console.log('shareData updated:', {
			hasSummary: !!shareData.summary,
			hasEditedSummary: !!shareData.editedSummary,
			hasCertificationResult: !!shareData.certificationResult,
			recordLoading,
			buttonDisabled: recordLoading || !!shareData.certificationResult
		});
		$shareDataStore = shareData;
	}
	$: $errorStore = error;

	async function handleSummarize() {
		if (!shareData) return;

		summarizeLoading = true;
		error = null;

		try {
			const response = await fetch(
				`/api/rust-wasm-summary?installation_id=${installationId}&repository=${encodeURIComponent(
					shareData.selectedRepo
				)}&context=${encodeURIComponent(shareData.context)}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to generate summary');
			}

			const data = await response.json();
			shareData.summary = data.summary.summary;
			shareData.editedSummary = shareData.summary;
			shareData.skills = data.summary.skills || [];
			// Reset certification result when new summary is generated
			shareData.certificationResult = undefined;
		} catch (err) {
			console.error('Error generating summary:', err);
			error = err instanceof Error ? err.message : 'Failed to generate summary';
		} finally {
			summarizeLoading = false;
		}
	}

	async function handleRecord() {
		console.log('handleRecord called');
		console.log('Current shareData:', {
			summary: shareData.summary,
			editedSummary: shareData.editedSummary,
			certificationResult: shareData.certificationResult
		});
		if (!shareData?.editedSummary) {
			console.log('No edited summary');
			error = 'Please generate a summary first';
			return;
		}

		if (!$page.data.session?.user?.email) {
			console.log('No user session:', $page.data.session);
			error = 'Please sign in to record your summary';
			return;
		}

		console.log('Starting record process');
		recordLoading = true;
		error = null;

		try {
			console.log('Calling certify with:', {
				summary: shareData.editedSummary,
				userId: $page.data.session.user.email
			});
			const result = await certify(
				shareData.editedSummary,
				$page.data.session.user.email,
				toastStore
			);
			console.log('Certification result:', result);
			// Store the result for sharing
			shareData = { ...shareData, certificationResult: result };
		} catch (err) {
			console.error('Error recording summary:', err);
			error = err instanceof Error ? err.message : 'Failed to record summary';
		} finally {
			recordLoading = false;
		}
	}

	async function handleShare() {
		if (!shareData.certificationResult) {
			error = 'Please record the summary first';
			return;
		}

		shareLoading = true;
		error = null;

		try {
			const link = generateLink(
				shareData.certificationResult.userId,
				shareData.certificationResult.hash
			);
			const fullUrl = window.location.origin + link;
			await navigator.clipboard.writeText(fullUrl);
			shareSuccess = true;
			setTimeout(() => {
				shareSuccess = false;
			}, 3000);
		} catch (err) {
			console.error('Error sharing:', err);
			error = err instanceof Error ? err.message : 'Failed to share';
		} finally {
			shareLoading = false;
		}
	}
</script>

<div class="share-page">
	{#if !shareData}
		<div class="loading">Loading...</div>
	{:else}
		<div class="share-header">
			<h1>Share Your Progress</h1>
			<p>Generate a comprehensive summary of your contributions and skills</p>
		</div>

		<div class="repository-highlight">
			<h2>Repository</h2>
			<div class="repo-selector">
				<select bind:value={shareData.selectedRepo}>
					<option value="algol">Algol</option>
					<option value="bhumel-app">Bhumel-app</option>
					<option value="hume">Hume</option>
				</select>
			</div>
		</div>

		<div class="share-content">
			<!-- Context Section -->
			<div class="card">
				<h2>Context</h2>
				<textarea
					bind:value={shareData.context}
					class="input-field"
					rows="4"
					placeholder="Enter context for the LLM..."
				></textarea>
				<button class="button primary" on:click={handleSummarize} disabled={summarizeLoading}>
					{#if summarizeLoading}
						Processing...
					{:else}
						Summarize
					{/if}
				</button>
			</div>

			<!-- Summary Section -->
			<div class="card">
				<h2>Summary</h2>
				<textarea
					class="input-field"
					rows="6"
					placeholder="Click the Summarize button to generate a summary..."
					readonly
					bind:value={shareData.editedSummary}
				></textarea>
				{#if shareData.skills && shareData.skills.length > 0}
					<div class="skills-section">
						<h3>Skills Demonstrated</h3>
						<div class="skills-list">
							{#each shareData.skills as skill, index (index)}
								<div class="skill-item">
									<h4>{skill.name}</h4>
									{#if skill.evidence && skill.evidence.length > 0}
										<ul class="evidence-list">
											{#each skill.evidence as evidence (evidence)}
												<li>{evidence}</li>
											{/each}
										</ul>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
				<div class="button-group">
					<button
						class="button success"
						on:click={() => {
							console.log('Button clicked - starting handleRecord');
							console.log('Current state:', {
								shareData,
								hasSummary: !!shareData.summary,
								hasEditedSummary: !!shareData.editedSummary,
								hasCertificationResult: !!shareData.certificationResult,
								userId: $page.data.session?.user?.email
							});
							handleRecord();
						}}
						type="button"
					>
						{#if recordLoading}
							Recording...
						{:else if shareData.certificationResult}
							Recorded
						{:else}
							Record
						{/if}
					</button>
					<button
						class="button accent"
						on:click={handleShare}
						disabled={shareLoading || !shareData.certificationResult}
					>
						{#if shareLoading}
							Sharing...
						{:else if shareSuccess}
							Copied!
						{:else}
							Share
						{/if}
					</button>
				</div>

				{#if shareSuccess}
					<div class="success-message">Verification link copied to clipboard!</div>
				{/if}

				{#if shareData.certificationResult}
					<div class="certification-info">
						<h3>Certification Details</h3>
						<p><strong>User ID:</strong> {shareData.certificationResult.userId}</p>
						<p>
							<strong>Timestamp:</strong>
							{new Date(shareData.certificationResult.timestamp).toLocaleString()}
						</p>
						<p>
							<strong>Hash:</strong> <span class="hash">{shareData.certificationResult.hash}</span>
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.share-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--background, #f8f9fc);
	}

	.share-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.share-header h1 {
		font-size: 3rem;
		color: var(--secondary, #33001a);
		margin-bottom: 1rem;
		font-weight: 700;
	}

	.share-header p {
		font-size: 1.2rem;
		color: var(--secondary, #33001a);
		opacity: 0.8;
	}

	.repository-highlight {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 1rem 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.repository-highlight h2 {
		margin-bottom: 0.75rem;
	}

	.repo-selector {
		max-width: 300px;
		margin: 0 auto;
	}

	.repo-selector select {
		width: 100%;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #ddd;
		background-color: white;
		font-size: 1rem;
		font-weight: 500;
		color: var(--primary);
		cursor: pointer;
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3e%3cpath fill='none' d='M0 0h24v24H0z'/%3e%3cpath d='M12 15l-4.243-4.243 1.415-1.414L12 12.172l2.828-2.829 1.415 1.414z' fill='%23800020'/%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 10px center;
		background-size: 20px;
	}

	.repo-selector select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px rgba(128, 0, 32, 0.2);
	}

	.share-content {
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

	.card h2 {
		margin: 0 0 1rem 0;
		color: var(--secondary, #33001a);
		font-size: 1.5rem;
		font-weight: 600;
	}

	.input-field {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		resize: vertical;
		color: var(--text, #33001a);
		background-color: white;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--primary, #800020);
	}

	.button {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		z-index: 1;
		pointer-events: auto;
	}

	.button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		pointer-events: none;
	}

	.button.primary {
		background-color: var(--primary, #800020);
		color: white;
	}

	.button.primary:hover:not(:disabled) {
		background-color: #600018;
	}

	.button.accent {
		background-color: var(--accent, #1a0004);
		color: white;
	}

	.button.accent:hover:not(:disabled) {
		background-color: #0d0002;
	}

	.button.success {
		background-color: var(--record, #b81b2e);
		color: white;
		pointer-events: auto;
	}

	.button.success:hover:not(:disabled) {
		background-color: #991526;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
		position: relative;
		z-index: 0;
		pointer-events: auto;
	}

	.skills-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e2e8f0;
	}

	.skills-section h3 {
		color: var(--secondary, #33001a);
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.skills-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.skill-item {
		background: #f8f9fc;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.skill-item h4 {
		color: var(--primary, #800020);
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}

	.evidence-list {
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: 0.9rem;
		color: var(--text, #33001a);
	}

	.evidence-list li {
		padding: 0.25rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.evidence-list li:last-child {
		border-bottom: none;
	}

	@media (max-width: 768px) {
		.share-page {
			padding: 1rem;
		}

		.share-header h1 {
			font-size: 2rem;
		}

		.button {
			width: 100%;
		}
	}

	.certification-info {
		margin-top: 1.5rem;
		padding: 1rem;
		background-color: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #e9ecef;
	}

	.certification-info h3 {
		margin: 0 0 0.75rem 0;
		color: var(--secondary, #33001a);
		font-size: 1.2rem;
	}

	.certification-info p {
		margin: 0.5rem 0;
		color: #495057;
	}

	.certification-info .hash {
		font-family: monospace;
		word-break: break-all;
		font-size: 0.9rem;
		background-color: #e9ecef;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.success-message {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #d4edda;
		color: #155724;
		border-radius: 4px;
		text-align: center;
	}
</style>
