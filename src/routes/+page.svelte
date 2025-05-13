<script>
	import { page } from '$app/stores';
</script>

<div class="home-container">
	<div class="hero">
		<h1>Welcome to Bhumel</h1>
		<p class="subtitle">Track your coding progress with AI-powered skill analysis</p>

		{#if $page.data.session}
			<a href="/dashboard/skill-progression" class="cta-button">View My Skills Dashboard</a>
		{:else}
			<a href="/signin" class="cta-button">Get Started</a>
		{/if}
	</div>
</div>

<style>
	.home-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 75vh;
		text-align: center;
		padding: 0 1rem;
	}

	.hero {
		max-width: 800px;
	}

	h1 {
		font-size: 3rem;
		font-weight: 800;
		color: #1e5af6;
		margin-bottom: 1rem;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #757575;
		margin-bottom: 2.5rem;
	}

	.cta-button {
		background-color: #1e5af6;
		color: white;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.cta-button:hover {
		background-color: #1348d4;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.25rem;
		}

		.subtitle {
			font-size: 1.2rem;
		}
	}
</style>
