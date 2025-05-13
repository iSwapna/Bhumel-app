<script>
	import { page } from '$app/stores';
</script>

<div class="home-container">
	<div class="cta-container">
		{#if !$page.data.session}
			<a href="/signin" class="cta-button">Get Started</a>
		{/if}
	</div>
</div>

<style>
	.home-container {
		min-height: 100vh;
		background-image: url('/Bhumel2.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding-bottom: 5rem;
	}

	.cta-container {
		position: relative;
		z-index: 2;
		padding: 1rem;
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
</style>
