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
		min-height: 90vh;
		text-align: center;
		padding: 0 1rem;
		background-image: url('/Bhumel2.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
	}

	/* Overlay to improve text readability */
	.home-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.85);
		z-index: 1;
	}

	.hero {
		max-width: 800px;
		position: relative;
		z-index: 2;
		padding: 2rem;
		border-radius: 8px;
		background-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 4px 30px rgba(128, 0, 32, 0.1);
	}

	h1 {
		font-size: 3.5rem;
		font-weight: 700;
		color: #800020;
		margin-bottom: 1rem;
		font-family: 'Playfair Display', serif;
	}

	.subtitle {
		font-size: 1.5rem;
		color: #5a5a5a;
		margin-bottom: 2.5rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 300;
	}

	.cta-button {
		background-color: #800020;
		color: white;
		padding: 1rem 2.5rem;
		border-radius: 4px;
		font-size: 1.1rem;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.3s;
		font-family: 'Montserrat', sans-serif;
		letter-spacing: 0.5px;
		display: inline-block;
	}

	.cta-button:hover {
		background-color: #600018;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(128, 0, 32, 0.2);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.2rem;
		}

		.hero {
			padding: 1.5rem;
		}
	}
</style>
