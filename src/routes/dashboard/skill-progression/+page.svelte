<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	// Chart.js for timeline visualization
	import {
		Chart,
		LineElement,
		PointElement,
		LineController,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	} from 'chart.js';
	import type { TooltipItem } from 'chart.js';

	// Register Chart.js components
	if (browser) {
		Chart.register(
			LineElement,
			PointElement,
			LineController,
			CategoryScale,
			LinearScale,
			Tooltip,
			Legend
		);
	}

	// Define types for our data structures
	interface Skill {
		skill: string;
		level: string;
	}

	interface ProgressionItem {
		commitDate: string;
		skills: Skill[];
	}

	interface CumulativeSkill {
		level: string;
		trend: 'improving' | 'stable' | 'declining';
		evidence: string[];
	}

	interface ProgressionData {
		progression: ProgressionItem[];
		cumulativeSkills: {
			cpp: CumulativeSkill;
			algorithms: CumulativeSkill;
			consistency: CumulativeSkill;
		};
		overallGrowth: string;
		recommendations: string[];
	}

	// Define Chart.js type and context
	type ChartInstance = Chart<'line', number[], string>;

	// State management
	let loading = true;
	let error: string | null = null;
	let progressionData: ProgressionData | null = null;
	let installationId = '';
	let maxCommits = 10;
	let timelineChart: ChartInstance | null = null;
	let selectedSkill = 'all';
	let dateRange: {
		start: Date | null;
		end: Date | null;
	} = {
		start: null,
		end: null
	};

	// Define color palette to match slides
	const colors = {
		primary: '#1E5AF6', // Blue
		secondary: '#6C00FF', // Deep purple
		accent: '#FC6E27', // Orange
		background: '#F8F9FC', // Light gray background
		text: '#2C2C2C', // Dark text
		lightText: '#757575', // Light text
		success: '#00A389', // Green
		warning: '#FFB800', // Yellow
		error: '#FF3B6B', // Red
		chartColors: ['#1E5AF6', '#FC6E27', '#00A389'] // Blue, Orange, Green for the three skills
	};

	// Skill level mapping for numeric values
	const skillLevelMap = {
		beginner: 1,
		intermediate: 2,
		advanced: 3
	};

	// Trend icons
	const trendIcons = {
		improving: '↗️',
		stable: '→',
		declining: '↘️'
	};

	onMount(async () => {
		// Get URL params if they exist
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('installation_id')) {
			const id = urlParams.get('installation_id');
			if (id) {
				installationId = id;
				await fetchData();
			}
		} else {
			loading = false;
		}
	});

	async function fetchData() {
		loading = true;
		error = null;

		try {
			const response = await fetch(
				`/api/analyze-gemini?installation_id=${installationId}&max_commits=${maxCommits}`
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to fetch progression data');
			}

			const data = await response.json();
			progressionData = data.progressionAnalysis;

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

			// Initialize chart after data is loaded
			initializeChart();
		} catch (err: unknown) {
			console.error('Error fetching data:', err);
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred';
			}
		} finally {
			loading = false;
		}
	}

	function initializeChart() {
		if (!browser || !progressionData || !progressionData.progression.length) return;

		// Get the canvas element
		const canvas = document.getElementById('skillProgressionChart') as HTMLCanvasElement | null;
		if (!canvas) return;

		// Destroy existing chart if it exists
		if (timelineChart) {
			timelineChart.destroy();
		}

		// Prepare data for chart
		const filteredProgression = filterProgressionData();
		const labels = filteredProgression.map((p) => {
			const date = new Date(p.commitDate);
			return date.toLocaleDateString();
		});

		// Extract skill levels for each skill type across progression
		const datasets = [
			{
				label: 'C++',
				data: extractSkillLevels(filteredProgression, 'C++'),
				borderColor: colors.chartColors[0],
				backgroundColor: `${colors.chartColors[0]}33`,
				tension: 0.3
			},
			{
				label: 'Algorithms',
				data: extractSkillLevels(filteredProgression, 'Algorithm'),
				borderColor: colors.chartColors[1],
				backgroundColor: `${colors.chartColors[1]}33`,
				tension: 0.3
			},
			{
				label: 'Consistency',
				data: extractSkillLevels(filteredProgression, 'Consistency'),
				borderColor: colors.chartColors[2],
				backgroundColor: `${colors.chartColors[2]}33`,
				tension: 0.3
			}
		];

		// Create the chart
		timelineChart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets:
					selectedSkill === 'all'
						? datasets
						: datasets.filter((d) => d.label.toLowerCase() === selectedSkill)
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						min: 0,
						max: 3.5,
						ticks: {
							callback: function (tickValue: string | number) {
								if (tickValue === 1) return 'Beginner';
								if (tickValue === 2) return 'Intermediate';
								if (tickValue === 3) return 'Advanced';
								return '';
							}
						},
						grid: {
							color: '#eaecef'
						}
					},
					x: {
						grid: {
							color: '#eaecef'
						}
					}
				},
				plugins: {
					tooltip: {
						callbacks: {
							title: function (context: { label: string }[]) {
								return `Commit: ${context[0].label}`;
							},
							label: function (tooltipItem: TooltipItem<'line'>) {
								const value = tooltipItem.raw as number;
								let label = '';
								if (value === 1) label = 'Beginner';
								if (value === 2) label = 'Intermediate';
								if (value === 3) label = 'Advanced';
								return `${tooltipItem.dataset?.label || ''}: ${label}`;
							}
						}
					},
					legend: {
						position: 'top'
					}
				}
			}
		});
	}

	function extractSkillLevels(
		progression: { skills: { skill: string; level: string }[] }[],
		skillType: string
	) {
		return progression.map((p) => {
			const skill = p.skills.find((s) => s.skill.toLowerCase().includes(skillType.toLowerCase()));
			const skillLevel = skill?.level?.toLowerCase();
			return skillLevel && skillLevel in skillLevelMap
				? skillLevelMap[skillLevel as keyof typeof skillLevelMap]
				: 0;
		});
	}

	function filterProgressionData() {
		if (!progressionData || !progressionData.progression) return [];

		let filtered = [...progressionData.progression];

		// Apply date filter
		if (dateRange.start && dateRange.end) {
			filtered = filtered.filter((p) => {
				const date = new Date(p.commitDate);
				return date >= dateRange.start! && date <= dateRange.end!;
			});
		}

		return filtered;
	}

	function handleFiltersChange() {
		initializeChart();
	}

	function handleInstallationSubmit() {
		goto(`?installation_id=${installationId}&max_commits=${maxCommits}`);
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

	{#if !installationId}
		<div class="setup-section">
			<h2>Get Started</h2>
			<div class="form-group">
				<label for="installation-id">GitHub Installation ID</label>
				<input
					type="text"
					id="installation-id"
					bind:value={installationId}
					placeholder="Enter your GitHub App installation ID"
				/>
			</div>
			<div class="form-group">
				<label for="max-commits">Maximum Commits to Analyze</label>
				<input type="number" id="max-commits" bind:value={maxCommits} min="1" max="50" />
			</div>
			<button class="primary-button" on:click={handleInstallationSubmit}>Analyze Repository</button>
		</div>
	{:else if loading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>Analyzing commit history...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<h2>Error</h2>
			<p>{error}</p>
			<button class="primary-button" on:click={fetchData}>Try Again</button>
		</div>
	{:else if progressionData}
		<div class="dashboard-content">
			<!-- Filter Controls Section -->
			<section class="filter-section">
				<h2>Filters</h2>
				<div class="filter-controls">
					<div class="filter-group">
						<label for="skill-filter">Skill</label>
						<select id="skill-filter" bind:value={selectedSkill} on:change={handleFiltersChange}>
							<option value="all">All Skills</option>
							<option value="c++">C++</option>
							<option value="algorithms">Algorithms</option>
							<option value="consistency">Consistency</option>
						</select>
					</div>
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

			<!-- Skill Summary Cards -->
			<section class="skill-summary">
				<div class="skill-card cpp">
					<h3>C++ Skills</h3>
					<div class="skill-level">
						<span class="level">{progressionData.cumulativeSkills.cpp.level}</span>
						<span class="trend"
							>{trendIcons[
								progressionData.cumulativeSkills.cpp.trend as keyof typeof trendIcons
							]}</span
						>
					</div>
					<div class="evidence">
						<p>Key evidence:</p>
						<ul>
							{#each progressionData.cumulativeSkills.cpp.evidence.slice(0, 2) as evidence, i (i)}
								<li>{evidence}</li>
							{/each}
						</ul>
					</div>
				</div>

				<div class="skill-card algorithms">
					<h3>Algorithm Skills</h3>
					<div class="skill-level">
						<span class="level">{progressionData.cumulativeSkills.algorithms.level}</span>
						<span class="trend"
							>{trendIcons[
								progressionData.cumulativeSkills.algorithms.trend as keyof typeof trendIcons
							]}</span
						>
					</div>
					<div class="evidence">
						<p>Key evidence:</p>
						<ul>
							{#each progressionData.cumulativeSkills.algorithms.evidence.slice(0, 2) as evidence, i (i)}
								<li>{evidence}</li>
							{/each}
						</ul>
					</div>
				</div>

				<div class="skill-card consistency">
					<h3>Consistency</h3>
					<div class="skill-level">
						<span class="level">{progressionData.cumulativeSkills.consistency.level}</span>
						<span class="trend"
							>{trendIcons[
								progressionData.cumulativeSkills.consistency.trend as keyof typeof trendIcons
							]}</span
						>
					</div>
					<div class="evidence">
						<p>Key evidence:</p>
						<ul>
							{#each progressionData.cumulativeSkills.consistency.evidence.slice(0, 2) as evidence, i (i)}
								<li>{evidence}</li>
							{/each}
						</ul>
					</div>
				</div>
			</section>

			<!-- Timeline Chart Section -->
			<section class="chart-section">
				<h2>Skills Progression Timeline</h2>
				<div class="chart-container">
					<canvas id="skillProgressionChart"></canvas>
				</div>
			</section>

			<!-- Recommendations Section -->
			<section class="recommendations-section">
				<h2>Recommendations</h2>
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
			</section>
		</div>
	{:else}
		<div class="empty-state">
			<h2>No Data Available</h2>
			<p>Try analyzing a repository to see skill progression data.</p>
			<button class="primary-button" on:click={fetchData}>Analyze Repository</button>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			Oxygen,
			Ubuntu,
			Cantarell,
			'Open Sans',
			'Helvetica Neue',
			sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		background-color: var(--background);
		color: var(--text);
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--primary);
		margin-bottom: 0.5rem;
	}

	header p {
		font-size: 1.125rem;
		color: var(--light-text);
	}

	.dashboard-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.setup-section,
	.filter-section,
	.chart-section,
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
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--primary);
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

	input,
	select {
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
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
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

	.chart-container {
		height: 400px;
		width: 100%;
	}

	.skill-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.skill-card {
		background-color: white;
		border-radius: 12px;
		padding: 1.5rem;
		border-top: 4px solid var(--primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.skill-card.cpp {
		border-top-color: var(--primary);
	}

	.skill-card.algorithms {
		border-top-color: var(--accent);
	}

	.skill-card.consistency {
		border-top-color: var(--success);
	}

	.skill-card h3 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.skill-level {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.level {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.trend {
		font-size: 1.25rem;
	}

	.evidence {
		font-size: 0.875rem;
	}

	.evidence p {
		font-weight: 500;
		margin-bottom: 0.5rem;
	}

	.evidence ul {
		padding-left: 1.5rem;
	}

	.evidence li {
		margin-bottom: 0.5rem;
	}

	.recommendations-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.overall-growth,
	.recommendations-list {
		background-color: white;
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

	.form-group {
		margin-bottom: 1.5rem;
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

		.skill-summary,
		.recommendations-section {
			grid-template-columns: 1fr;
		}
	}
</style>
