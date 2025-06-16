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

	// Return an HTML page that closes the popup and notifies the parent window
	const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>GitHub App Installation Complete</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #f6f8fa;
                    color: #24292f;
                }
                .container {
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 6px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                }
                h1 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }
                p {
                    margin: 0.5rem 0;
                    color: #57606a;
                }
                .success {
                    color: #2da44e;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Installation Complete</h1>
                <p class="success">✓ GitHub App has been successfully installed</p>
                <p>You can close this window and return to the application.</p>
            </div>
            <script>
                // Notify the parent window about successful installation
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'github-app-installation',
                        status: 'success',
                        installationId: '${installationId}',
                        setupAction: '${setupAction}',
                        state: '${state}'
                    }, '*');
                    
                    // Close the popup after a short delay
                    setTimeout(() => window.close(), 1500);
                }
            </script>
        </body>
        </html>
    `;

	return new Response(html, {
		headers: {
			'Content-Type': 'text/html'
		}
	});
};
