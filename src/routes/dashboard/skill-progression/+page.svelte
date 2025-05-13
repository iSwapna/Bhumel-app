<script lang="ts">
	import { onMount } from 'svelte';
	import {
		progressionStore,
		loadingStore,
		errorStore,
		dateRangeStore,
		maxCommitsStore,
		processingBatchesStore,
		batchProgressStore,
		repositoryStore,
		type ProgressionData
	} from '$lib/stores/dashboardStore';

	// State from stores
	let loading = $loadingStore;
	let error = $errorStore;
	let progressionData = $progressionStore;
	let installationId = '66241334'; // Hardcoded installation ID
	let repository = $repositoryStore;
	let maxCommits = $maxCommitsStore;
	let dateRange = $dateRangeStore;
	let processingBatches = $processingBatchesStore;
	let batchProgress = $batchProgressStore;

	// Update store values when local variables change
	$: $loadingStore = loading;
	$: $errorStore = error;
	$: $progressionStore = progressionData;
	$: $repositoryStore = repository;
	$: $maxCommitsStore = maxCommits;
	$: $dateRangeStore = dateRange;
	$: $processingBatchesStore = processingBatches;
	$: $batchProgressStore = batchProgress;

	let totalBatches = 0;
	let batchSize = 3;

	// Define color palette with new text color
	const colors = {
		primary: '#800020', // Maroon
		secondary: '#33001a', // Dark maroon text color
		accent: '#FC6E27', // Orange
		background: '#F8F9FC', // Light gray background
		text: '#33001a', // Dark maroon text
		lightText: '#33001a', // Dark maroon text
		success: '#00A389', // Green
		warning: '#FFB800', // Yellow
		error: '#FF3B6B', // Red
		chartColors: ['#800020', '#FC6E27', '#00A389'] // Maroon, Orange, Green for the three skills
	};

	onMount(async () => {
		// Only fetch data if we don't already have it
		if (!$progressionStore) {
			await fetchData();
		}
	});

	async function fetchData() {
		loading = true;
		error = null;
		processingBatches = false;
		batchProgress = 0;

		try {
			// Initial fetch with first batch
			const response = await fetch(
				`/api/analyze-gemini?installation_id=${installationId}&max_commits=${maxCommits}&batch_size=${batchSize}&repository=${repository}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to fetch progression data');
			}

			const data = await response.json();
			progressionData = data.progressionAnalysis;
			totalBatches = data.totalBatches;

			// Process remaining batches if there are any
			if (data.remainingBatches > 0 && data.commitBatches && data.commitBatches.length > 0) {
				processingBatches = true;

				// Start processing the remaining batches
				for (let batchId = 1; batchId < totalBatches; batchId++) {
					try {
						const batchResponse = await fetch(`/api/analyze-gemini`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								installationId: data.installationId,
								repository: repository,
								commitBatch: data.commitBatches[batchId - 1], // Get the correct batch from the server
								batchId,
								totalBatches: data.totalBatches
							})
						});

						if (!batchResponse.ok) {
							console.error(`Failed to process batch ${batchId + 1}/${totalBatches}`);
							continue;
						}

						const batchData = await batchResponse.json();

						if (batchData.success) {
							// Merge the batch results with existing data
							if (progressionData) {
								progressionData = mergeBatchResults(progressionData, batchData.batchResults);
							} else {
								progressionData = batchData.batchResults;
							}
							batchProgress = Math.round(((batchId + 1) / totalBatches) * 100);
						}
					} catch (batchErr) {
						console.error(`Error processing batch ${batchId + 1}:`, batchErr);
					}
				}
			}

			// Initialize date range from the data
			if (
				progressionData &&
				progressionData.progression &&
				progressionData.progression.length > 0
			) {
				const dates = progressionData.progression.map((p) => new Date(p.commitDate).getTime());
				dateRange.start = new Date(Math.min(...dates));
				dateRange.end = new Date(Math.max(...dates));
			}
		} catch (err: unknown) {
			console.error('Error fetching data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred';
			}
		} finally {
			loading = false;
			processingBatches = false;
		}
	}

	// Helper function to merge batch results
	function mergeBatchResults(
		currentData: ProgressionData,
		newBatchData: ProgressionData
	): ProgressionData {
		// Create a deep copy of the current data to avoid mutation
		const mergedData = JSON.parse(JSON.stringify(currentData));

		// Merge progression data
		if (newBatchData.progression && newBatchData.progression.length > 0) {
			mergedData.progression = [...mergedData.progression, ...newBatchData.progression];

			// Sort by date
			mergedData.progression.sort(
				(a: ProgressionItem, b: ProgressionItem) =>
					new Date(a.commitDate).getTime() - new Date(b.commitDate).getTime()
			);
		}

		// Merge CLRS areas by averaging or taking max values
		if (newBatchData.clrsAreas) {
			// Define allowed areas for type safety
			const areas = [
				'foundations',
				'divideAndConquer',
				'dataStructures',
				'advancedDesign',
				'graphAlgorithms',
				'selectedTopics'
			] as const;

			// Use the defined areas to iterate
			areas.forEach((area) => {
				if (mergedData.clrsAreas[area] && newBatchData.clrsAreas[area]) {
					// Take the higher coverage value
					mergedData.clrsAreas[area].coverage = Math.max(
						mergedData.clrsAreas[area].coverage,
						newBatchData.clrsAreas[area].coverage
					);

					// Merge examples, avoiding duplicates
					const existingExamples = new Set(mergedData.clrsAreas[area].examples);
					newBatchData.clrsAreas[area].examples.forEach((example: string) => {
						existingExamples.add(example);
					});
					mergedData.clrsAreas[area].examples = Array.from(existingExamples);
				}
			});
		}

		// Update recommendations if they're better
		if (newBatchData.recommendations && newBatchData.recommendations.length > 0) {
			// For simplicity, just take the newest recommendations
			mergedData.recommendations = newBatchData.recommendations;
		}

		// Update overall growth assessment
		if (newBatchData.overallGrowth) {
			mergedData.overallGrowth = newBatchData.overallGrowth;
		}

		return mergedData;
	}

	function handleFiltersChange() {
		// Update filtering
	}

	// For TypeScript type safety
	interface ProgressionItem {
		commitDate: string;
		skills: Skill[];
	}

	interface Skill {
		skill: string;
		level: string;
	}
</script>

<svelte:head>
	<title>Skill Progression Dashboard</title>
</svelte:head>

<div
	class="dashboard"
	style="--primary: {colors.primary}; --secondary: {colors.secondary}; --accent: {colors.accent}; 
                             --background: {colors.background}; --text: {colors.text}; --light-text: {colors.lightText};
                             --success: {colors.success}; --warning: {colors.warning}; --error: {colors.error};"
>
	<header>
		<h1>Skill Progression Dashboard</h1>
		<p>Track development skills over time with AI-powered analysis</p>
	</header>

	<div class="repository-highlight">
		<h2>Repository: <span class="repo-name">{repository}</span></h2>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			{#if processingBatches && batchProgress > 0}
				<p>Processing batches: {batchProgress}% complete...</p>
				<div class="batch-progress-bar">
					<div class="batch-progress" style="width: {batchProgress}%"></div>
				</div>
			{:else}
				<p>Analyzing {repository} repository commit history...</p>
			{/if}
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Error</h2>
			<p>{error}</p>
			<button class="primary-button" on:click={fetchData}>Try Analyzing {repository} Again</button>
		</div>
	{:else if progressionData}
		<div class="dashboard-content">
			<!-- Filter Controls Section -->
			<section class="filter-section">
				<h2>Filters</h2>
				<div class="filter-controls">
					<div class="filter-group">
						<label for="date-start">From</label>
						<input
							type="date"
							id="date-start"
							bind:value={dateRange.start}
							on:change={handleFiltersChange}
						/>
					</div>
					<div class="filter-group">
						<label for="date-end">To</label>
						<input
							type="date"
							id="date-end"
							bind:value={dateRange.end}
							on:change={handleFiltersChange}
						/>
					</div>
					<div class="filter-group">
						<label for="max-commits-filter">Max Commits</label>
						<input type="number" id="max-commits-filter" bind:value={maxCommits} min="1" max="50" />
					</div>
					<button class="refresh-button" on:click={fetchData}>Refresh</button>
				</div>
			</section>

			<!-- Recommendations Section -->
			<section class="recommendations-section">
				<h2>Recommendations</h2>
				<div class="recommendations-container">
					<div class="overall-growth">
						<h3>Overall Growth</h3>
						<p>{progressionData.overallGrowth}</p>
					</div>
					<div class="recommendations-list">
						<h3>Next Steps</h3>
						<ul>
							{#each progressionData.recommendations as recommendation, i (i)}
								<li>{recommendation}</li>
							{/each}
						</ul>
					</div>
				</div>
			</section>

			<!-- CLRS Progress Section -->
			<section class="clrs-progress-section">
				<h2>CLRS Algorithm Coverage</h2>
				<p>
					Progress across different areas of "Introduction to Algorithms" by Cormen, Leiserson,
					Rivest, and Stein
				</p>

				{#if progressionData.clrsAreas}
					<div class="clrs-progress-bars">
						<div class="clrs-area">
							<div class="area-header">
								<h3>Foundations (Ch. 1-3)</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.foundations.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.foundations.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.foundations.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.foundations.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<div class="clrs-area">
							<div class="area-header">
								<h3>Divide-and-Conquer (Ch. 4-8)</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.divideAndConquer.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.divideAndConquer.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.divideAndConquer.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.divideAndConquer.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<div class="clrs-area">
							<div class="area-header">
								<h3>Data Structures (Ch. 10-14)</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.dataStructures.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.dataStructures.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.dataStructures.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.dataStructures.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<div class="clrs-area">
							<div class="area-header">
								<h3>Advanced Design & Analysis (Ch. 15-17)</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.advancedDesign.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.advancedDesign.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.advancedDesign.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.advancedDesign.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<div class="clrs-area">
							<div class="area-header">
								<h3>Graph Algorithms (Ch. 22-26)</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.graphAlgorithms.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.graphAlgorithms.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.graphAlgorithms.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.graphAlgorithms.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>

						<div class="clrs-area">
							<div class="area-header">
								<h3>Selected Topics</h3>
								<span class="coverage-percent"
									>{progressionData.clrsAreas.selectedTopics.coverage}%</span
								>
							</div>
							<div class="progress-container">
								<div
									class="progress-bar"
									style="width: {progressionData.clrsAreas.selectedTopics.coverage}%"
								></div>
							</div>
							{#if progressionData.clrsAreas.selectedTopics.examples.length > 0}
								<div class="examples">
									<h4>Examples:</h4>
									<ul>
										{#each progressionData.clrsAreas.selectedTopics.examples.slice(0, 2) as example, i (i)}
											<li>{example}</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<p class="no-clrs-data">No CLRS algorithm coverage data available</p>
				{/if}
			</section>
		</div>
	{:else}
		<div class="empty-state">
			<h2>No Data Available</h2>
			<p>Click the button below to analyze the {repository} repository.</p>
			<button class="primary-button" on:click={fetchData}>Analyze {repository} Repository</button>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		font-family: 'Roboto', sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--background);
		color: #33001a;
		font-weight: 500;
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
		margin-bottom: 0;
	}

	.repo-name {
		color: var(--primary);
		font-weight: 700;
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	header h1 {
		font-size: 2.75rem;
		font-weight: 900;
		color: #33001a;
		margin-bottom: 0.5rem;
		font-family: 'Roboto Slab', serif;
		letter-spacing: -0.02em;
	}

	header p {
		font-size: 1.25rem;
		color: #33001a;
		font-weight: 500;
	}

	.dashboard-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.filter-section,
	.recommendations-section,
	.empty-state,
	.loading-container,
	.error-container {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 1.5rem;
	}

	h2 {
		font-size: 1.75rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: #33001a;
		font-family: 'Roboto Slab', serif;
		letter-spacing: -0.02em;
	}

	.filter-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-end;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		min-width: 150px;
	}

	label {
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.primary-button,
	.refresh-button {
		background-color: var(--primary);
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.75rem 1.5rem;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.2s;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.primary-button:hover,
	.refresh-button:hover {
		background-color: color-mix(in srgb, var(--primary) 90%, black);
	}

	.refresh-button {
		background-color: var(--secondary);
	}

	.refresh-button:hover {
		background-color: color-mix(in srgb, var(--secondary) 90%, black);
	}

	.recommendations-section {
		background-color: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 1.5rem;
	}

	.recommendations-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.overall-growth,
	.recommendations-list {
		background-color: #fafafa;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.recommendations-list ul {
		padding-left: 1.5rem;
	}

	.recommendations-list li {
		margin-bottom: 0.75rem;
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 5px solid rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		border-top-color: var(--primary);
		animation: spin 1s ease-in-out infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-container,
	.error-container,
	.empty-state {
		text-align: center;
		padding: 3rem;
	}

	@media (min-width: 768px) {
		.dashboard-content {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 2rem;
		}

		.filter-section,
		.clrs-progress-section {
			grid-column: 1;
		}

		.recommendations-section {
			grid-column: 2;
			grid-row: span 2;
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.filter-controls {
			flex-direction: column;
		}

		.filter-group {
			width: 100%;
		}

		.dashboard-content {
			display: flex;
			flex-direction: column;
		}
	}

	/* CLRS Progress Bars Styles */
	.clrs-progress-section {
		background-color: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		margin-top: 2rem;
	}

	.clrs-progress-section > p {
		margin-bottom: 1.5rem;
		color: var(--light-text);
	}

	.clrs-progress-bars {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.clrs-area {
		padding: 1rem;
		background-color: #fafafa;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.area-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.area-header h3 {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
	}

	.coverage-percent {
		font-weight: 700;
		color: var(--primary);
	}

	.progress-container {
		height: 12px;
		background-color: #e9ecef;
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 1rem;
	}

	.progress-bar {
		height: 100%;
		background: linear-gradient(to right, var(--primary), var(--secondary));
		border-radius: 6px;
		transition: width 0.5s ease;
	}

	.examples {
		margin-top: 0.75rem;
	}

	.examples h4 {
		font-size: 0.9rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.examples ul {
		padding-left: 1.25rem;
		margin: 0;
	}

	.examples li {
		font-size: 0.85rem;
		margin-bottom: 0.25rem;
	}

	.no-clrs-data {
		text-align: center;
		padding: 2rem;
		color: var(--light-text);
		font-style: italic;
	}

	.batch-progress-bar {
		width: 80%;
		height: 8px;
		background-color: #e9ecef;
		border-radius: 4px;
		margin: 1rem auto;
		overflow: hidden;
	}

	.batch-progress {
		height: 100%;
		background: linear-gradient(to right, var(--primary), var(--secondary));
		border-radius: 4px;
		transition: width 0.3s ease;
	}
</style>
