<script>
	// Dashboard layout
</script>

<div class="dashboard-container">
	<slot />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #f8f9fc;
	}

	.dashboard-container {
		max-width: 1200px;
		margin: 1rem auto;
		padding: 0 1rem;
	}

	@media (max-width: 768px) {
		.dashboard-container {
			margin: 0.5rem auto;
		}
	}
</style>
