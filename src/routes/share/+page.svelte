<script lang="ts">
	let context = '';
	let selectedRepo = '';
	let summary = '';
	let confidenceScore = 0;
	let isEditing = false;
	let editedSummary = '';
	let isProcessing = false;

	// Mock repositories - replace with actual data
	const repositories = [
		{ id: 'algol', name: 'Algorithms' },
		{ id: 'ds', name: 'Data Structures' },
		{ id: 'web', name: 'Web Development' }
	];

	function handleSummarize() {
		isProcessing = true;
		// TODO: Implement actual summarization logic
		setTimeout(() => {
			summary = `Based on the provided context: "${context}", the user has demonstrated strong skills in:
1. Problem Solving
2. Code Organization
3. Algorithm Implementation

The work shows consistent progress in understanding core concepts and applying them effectively.`;
			editedSummary = summary;
			isProcessing = false;
		}, 1000);
	}

	function handleVerify() {
		isProcessing = true;
		// TODO: Implement actual verification logic
		setTimeout(() => {
			confidenceScore = 85; // Mock score
			isProcessing = false;
		}, 1000);
	}
</script>

<div class="share-page">
	<div class="share-header">
		<h1>Share Your Progress</h1>
		<p>Generate a comprehensive summary of your contributions and skills</p>
	</div>

	<!-- Repository Selection -->
	<div class="repository-selector">
		<select bind:value={selectedRepo} class="select-field">
			<option value="">Select a repository</option>
			{#each repositories as repo (repo.id)}
				<option value={repo.id}>{repo.name}</option>
			{/each}
		</select>
	</div>

	<div class="share-content">
		<!-- Context Section -->
		<div class="card">
			<h2>Context</h2>
			<textarea
				bind:value={context}
				class="input-field"
				rows="4"
				placeholder="Enter context for the LLM..."
			></textarea>
			<button class="button primary" on:click={handleSummarize} disabled={isProcessing}>
				{#if isProcessing}
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
				readonly={!isEditing}
				bind:value={editedSummary}
			></textarea>
			<div class="button-group">
				<button class="button secondary" on:click={() => (isEditing = !isEditing)}>
					{isEditing ? 'Done Editing' : 'Edit'}
				</button>
				<button class="button accent" on:click={handleVerify} disabled={isProcessing}>
					{#if isProcessing}
						Verifying...
					{:else}
						Verify
					{/if}
				</button>
				<button class="button success" on:click={() => console.log('Record clicked')}>
					Record
				</button>
				<button class="button accent" on:click={() => console.log('Share clicked')}> Share </button>
			</div>
			{#if confidenceScore > 0}
				<div class="confidence-score">
					Confidence Score: <span class="score">{confidenceScore}%</span>
				</div>
			{/if}
		</div>
	</div>
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

	.repository-selector {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.repository-selector .select-field {
		width: 300px;
		padding: 0.75rem 3rem 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1.1rem;
		color: var(--text, #33001a);
		background-color: white;
		text-align: left;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2333001a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 1em;
	}

	.repository-selector .select-field:focus {
		outline: none;
		border-color: var(--primary, #800020);
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

	.button.secondary {
		background-color: var(--edit, #4a1b2e);
		color: white;
	}

	.button.secondary:hover:not(:disabled) {
		background-color: #3a1524;
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

	.confidence-score {
		margin-top: 1rem;
		text-align: center;
		font-size: 1.1rem;
		color: var(--text, #33001a);
	}

	.confidence-score .score {
		font-weight: bold;
		color: var(--verify, #7d1b2e);
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
