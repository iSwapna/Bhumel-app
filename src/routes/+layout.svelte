<script>
	import { page } from '$app/stores';

	// The logo is in the static folder
	const logoPath = '/logo.png';
</script>

<div class="app">
	<header>
		<nav>
			<div class="left">
				<a href="/" class="logo-container">
					<img src={logoPath} alt="Bhumel Logo" class="logo" />
				</a>
			</div>
			<div class="right">
				{#if $page.data.session}
					<div class="user-info">
						<span class="user-name">{$page.data.session.user?.name || 'User'}</span>
						<form action="/signout" method="POST">
							<button type="submit" class="sign-out-btn">Sign Out</button>
						</form>
					</div>
				{:else}
					<form action="/signin?provider=github" method="POST">
						<button type="submit" class="sign-in-btn">Sign In with GitHub</button>
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
		height: 60px;
		width: auto;
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
		transition: background-color 0.2s;
		border: none;
		font-size: 1rem;
		cursor: pointer;
	}

	.sign-in-btn {
		background-color: #1e5af6;
		color: white;
	}

	.sign-out-btn {
		color: #1e5af6;
		border: 1px solid #1e5af6;
		background-color: transparent;
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

		.logo {
			height: 50px;
		}
	}
</style>
