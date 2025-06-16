import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const installationId = url.searchParams.get('installation_id');
	const setupAction = url.searchParams.get('setup_action');
	const state = url.searchParams.get('state');

	console.log('Post-installation setup:', {
		timestamp: new Date().toISOString(),
		installationId,
		setupAction,
		state
	});

	// Return HTML that closes the popup and notifies the parent window
	return new Response(
		`<!DOCTYPE html>
		<html>
			<head>
				<title>GitHub App Installation</title>
			</head>
			<body>
				<h1>Installation Successful!</h1>
				<p>You can close this window.</p>
				<script>
					// Notify parent window of installation success
					if (window.opener) {
						window.opener.postMessage({
							type: 'github-app-installation',
							installationId: '${installationId}',
							status: 'success'
						}, '*');
						window.close();
					}
				</script>
			</body>
		</html>`,
		{
			headers: {
				'Content-Type': 'text/html'
			}
		}
	);
};
