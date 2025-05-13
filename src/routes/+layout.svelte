<script>
	import { page } from '$app/stores';

	// The logo is in the static folder
	const logoPath = '/logo.png';
	// Variables removed to fix linting errors
</script>

<div class="app">
	<header>
		<nav>
			<div class="nav-tabs">
				<a href="/discover" class="nav-tab">Discover</a>
				<a href="/dashboard/skill-progression" class="nav-tab">Track</a>
				<a href="/share" class="nav-tab">Share</a>
			</div>

			<div class="logo-container">
				<a href="/" class="logo-link">
					<img src={logoPath} alt="Bhumel Logo" class="logo" />
				</a>
			</div>

			<div class="user-section">
				{#if $page.data.session}
					<div class="user-info">
						<span class="user-name">{$page.data.session.user?.name || 'User'}</span>
						<form action="/signout" method="POST">
							<button type="submit" class="sign-out-btn">Sign Out</button>
						</form>
					</div>
				{:else}
					<form action="/signin?provider=github" method="POST">
						<button type="submit" class="sign-in-btn">Sign In</button>
					</form>
				{/if}
			</div>
		</nav>
	</header>

	<main>
		<slot />
	</main>
</div>

<style>
	/* Import elegant fonts to match logo */
	@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

	:global(body) {
		font-family: 'Montserrat', sans-serif;
		margin: 0;
		padding: 0;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Playfair Display', serif;
		color: #800020;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background-color: white;
		box-shadow: 0 2px 8px rgba(128, 0, 32, 0.1);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		position: relative;
	}

	.nav-tabs {
		display: flex;
		gap: 2rem;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.nav-tab {
		color: #800020; /* Maroon color */
		text-decoration: none;
		font-family: 'Playfair Display', serif;
		font-weight: 500;
		font-size: 1.1rem;
		padding: 1rem 0.5rem;
		position: relative;
		transition: color 0.2s;
		letter-spacing: 0.5px;
	}

	.nav-tab:hover {
		color: #600018; /* Darker maroon */
	}

	.nav-tab:after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background-color: #800020; /* Maroon color */
		transition: width 0.3s;
	}

	.nav-tab:hover:after {
		width: 100%;
	}

	.logo-container {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
		padding: 0.5rem;
	}

	.logo {
		height: 70px;
		width: auto;
		display: block;
	}

	.user-section {
		margin-left: auto;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-name {
		font-weight: 500;
		color: #800020; /* Maroon color */
		font-family: 'Montserrat', sans-serif;
	}

	.sign-in-btn,
	.sign-out-btn {
		padding: 0.5rem 1.2rem;
		border-radius: 4px;
		font-weight: 500;
		transition: all 0.2s;
		border: none;
		font-size: 0.95rem;
		cursor: pointer;
		font-family: 'Montserrat', sans-serif;
		letter-spacing: 0.5px;
	}

	.sign-in-btn {
		background-color: #800020; /* Maroon color */
		color: white;
	}

	.sign-out-btn {
		color: #800020; /* Maroon color */
		border: 1px solid #800020; /* Maroon color */
		background-color: transparent;
	}

	.sign-in-btn:hover {
		background-color: #600018; /* Darker maroon */
		transform: translateY(-1px);
	}

	.sign-out-btn:hover {
		background-color: rgba(128, 0, 32, 0.05);
		transform: translateY(-1px);
	}

	main {
		flex: 1;
		padding: 1rem;
	}

	@media (max-width: 768px) {
		nav {
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
		}

		.logo-container {
			position: relative;
			left: auto;
			transform: none;
			order: 1;
		}

		.nav-tabs {
			position: relative;
			left: auto;
			transform: none;
			width: 100%;
			justify-content: center;
			order: 2;
		}

		.user-section {
			margin-left: 0;
			order: 3;
			width: 100%;
			display: flex;
			justify-content: center;
		}

		.logo {
			height: 60px;
		}

		.nav-tab {
			font-size: 1rem;
			padding: 0.75rem 0.5rem;
		}
	}
</style>
