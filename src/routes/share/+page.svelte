<script lang="ts">
	import { shareDataStore, loadingStore, errorStore } from '$lib/stores/shareStore';
	import { onMount } from 'svelte';

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
	}

	const defaultShareData: ShareData = {
		context: '',
		selectedRepo: 'algol',
		summary: '',
		confidenceScore: 0,
		isEditing: false,
		editedSummary: '',
		skills: []
	};

	// Initialize share data if not exists
	onMount(() => {
		if (!$shareDataStore) {
			$shareDataStore = defaultShareData;
		}
	});

	// Get store values
	let shareData: ShareData = $shareDataStore || defaultShareData;
	let loading = $loadingStore;
	let error = $errorStore;
	let installationId = '66241334'; // GitHub installation ID

	// Update store values when local variables change
	$: $shareDataStore = shareData;
	$: $loadingStore = loading;
	$: $errorStore = error;

	async function handleSummarize() {
		if (!shareData) return;

		loading = true;
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
		} catch (err) {
			console.error('Error generating summary:', err);
			error = err instanceof Error ? err.message : 'Failed to generate summary';
		} finally {
			loading = false;
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
				<button class="button primary" on:click={handleSummarize} disabled={loading}>
					{#if loading}
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
					<button class="button success" on:click={() => console.log('Record clicked')}>
						Record
					</button>
					<button class="button accent" on:click={() => console.log('Share clicked')}>
						Share
					</button>
				</div>
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
	}

	.button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
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
	}

	.button.success:hover:not(:disabled) {
		background-color: #991526;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
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
</style>
