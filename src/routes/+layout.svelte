<script>
	import { page } from '$app/stores';

	// The logo is in the static folder
	const logoPath = '/logo.png';
	const appName = 'Bhumel';
</script>

<div class="app">
	<header>
		<nav>
			<div class="left">
				<a href="/" class="logo-container">
					<img src={logoPath} alt="{appName} Logo" class="logo" />
					<span class="app-name">{appName}</span>
				</a>
			</div>
			<div class="right">
				{#if $page.data.session}
					<div class="user-info">
						<span class="user-name">{$page.data.session.user?.name || 'User'}</span>
						<a href="/signout" class="sign-out-btn">Sign Out</a>
					</div>
				{:else}
					<a href="/signin" class="sign-in-btn">Sign In</a>
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
	}

	.left,
	.right {
		display: flex;
		align-items: center;
	}

	.logo-container {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	.logo {
		height: 40px;
		width: auto;
		margin-right: 0.75rem;
	}

	.app-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1e5af6;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-name {
		font-weight: 500;
	}

	.sign-in-btn,
	.sign-out-btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		text-decoration: none;
		transition: background-color 0.2s;
	}

	.sign-in-btn {
		background-color: #1e5af6;
		color: white;
	}

	.sign-out-btn {
		color: #1e5af6;
		border: 1px solid #1e5af6;
	}

	.sign-in-btn:hover {
		background-color: #1348d4;
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
			padding: 1rem;
		}

		.app-name {
			font-size: 1.2rem;
		}

		.logo {
			height: 32px;
		}
	}
</style>
