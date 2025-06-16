import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
	console.log('Callback Request Details:', {
		url: url.toString(),
		method: request.method,
		headers: Object.fromEntries(request.headers.entries()),
		searchParams: Object.fromEntries(url.searchParams.entries())
	});

	const installationId = url.searchParams.get('installation_id');
	const state = url.searchParams.get('state');
	const setupAction = url.searchParams.get('setup_action');

	console.log('Callback Parameters:', { installationId, state, setupAction });

	// Return an HTML page that will close the popup window and notify the parent
	return new Response(
		`
        <!DOCTYPE html>
        <html>
            <head>
                <title>GitHub App Installation</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f6f8fa;
                    }
                    .message {
                        text-align: center;
                        padding: 2rem;
                        background: white;
                        border-radius: 6px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                        max-width: 400px;
                    }
                    .status {
                        margin: 1rem 0;
                        padding: 0.5rem;
                        border-radius: 4px;
                        background: #f1f8ff;
                    }
                    .error {
                        color: #d73a49;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <h2>GitHub App Installation</h2>
                    <div class="status">
                        ${
													installationId
														? `<p>✅ Installation successful! (ID: ${installationId})</p>`
														: `<p class="error">⚠️ No installation ID received</p>`
												}
                        ${state ? `<p>State: ${state}</p>` : ''}
                        ${setupAction ? `<p>Action: ${setupAction}</p>` : ''}
                    </div>
                    <p>You can close this window now.</p>
                </div>
                <script>
                    console.log('Callback page loaded');
                    console.log('Window opener:', window.opener ? 'exists' : 'null');
                    console.log('URL:', window.location.href);
                    console.log('Search params:', new URLSearchParams(window.location.search).toString());
                    
                    // Notify the parent window about the installation
                    if (window.opener) {
                        console.log('Sending message to opener');
                        window.opener.postMessage({
                            type: 'github-app-installation',
                            success: true,
                            installationId: ${installationId || 'null'}
                        }, '*');
                    }

                    // Close the popup window
                    console.log('Attempting to close window');
                    window.close();
                </script>
            </body>
        </html>
        `,
		{
			headers: {
				'Content-Type': 'text/html'
			}
		}
	);
};
