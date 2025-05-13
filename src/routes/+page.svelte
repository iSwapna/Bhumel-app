<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// Function to handle navigation
	function navigateTo(path: string): void {
		goto(path);
	}
</script>

<div class="page-container">
	<nav class="top-nav">
		<ul class="nav-menu">
			<li class="nav-item">
				<button class="nav-link">Discover</button>
			</li>
			<li class="nav-item">
				<button class="nav-link" on:click={() => navigateTo('/dashboard/skill-progression')}
					>Track</button
				>
			</li>
			<li class="nav-item">
				<button class="nav-link">Share</button>
			</li>
		</ul>
	</nav>

	<div class="content">
		<h1>Login</h1>
		<div class="auth-container">
			{#if $page.data.session}
				{#if $page.data.session.user?.image}
					<img src={$page.data.session.user.image} class="avatar" alt="User Avatar" />
				{/if}
				<span class="signedInText">
					<small>Signed in as</small><br />
					<strong>{$page.data.session.user?.name ?? 'User'}</strong>
				</span>
				<SignOut>
					<div slot="submitButton" class="buttonPrimary">Sign out</div>
				</SignOut>
			{:else}
				<span class="notSignedInText">You are not signed in</span>
				<SignIn provider="github" />
			{/if}
		</div>
	</div>
</div>

<style>
	.page-container {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	.top-nav {
		margin-bottom: 2rem;
		border-bottom: 1px solid #eaeaea;
		padding-bottom: 1rem;
	}

	.nav-menu {
		display: flex;
		list-style: none;
		padding: 0;
		margin: 0;
		gap: 2rem;
	}

	.nav-item {
		display: inline-block;
	}

	.nav-link {
		background: none;
		border: none;
		color: #333;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		padding: 0.5rem 0;
		position: relative;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: #1e5af6;
	}

	.nav-link:hover::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background-color: #1e5af6;
	}

	.content {
		padding: 1rem 0;
	}

	.auth-container {
		margin-top: 1rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.avatar {
		border-radius: 50%;
		width: 40px;
		height: 40px;
		margin-right: 1rem;
	}

	.buttonPrimary {
		background-color: #1e5af6;
		color: white;
		border: none;
		border-radius: 4px;
		font-weight: 500;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}

	.signedInText,
	.notSignedInText {
		margin-right: 1rem;
	}
</style>
