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
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background-color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
		font-weight: 600;
		padding: 1rem 0.5rem;
		position: relative;
		transition: color 0.2s;
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
		height: 3px;
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
		background-color: white;
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
	}

	.sign-in-btn,
	.sign-out-btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		transition: background-color 0.2s;
		border: none;
		font-size: 1rem;
		cursor: pointer;
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
	}

	.sign-out-btn:hover {
		background-color: #f5f7ff;
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
	}
</style>
